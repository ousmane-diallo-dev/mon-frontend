import React, { useEffect, useState } from "react";
import api from "../api/axios";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/users")
      .then(res => setUsers((res.data as any).data || []))
      .catch(() => setError("Erreur lors du chargement des utilisateurs"))
      .then(() => setLoading(false));
  }, []);

  const promote = async (id: string) => {
    if (!window.confirm("Promouvoir cet utilisateur en admin ?")) return;
    setPromoting(id);
    try {
      await api.put(`/api/users/${id}/promote`);
      setUsers(users => users.map(u => u._id === id ? { ...u, role: "admin" } : u));
      alert("Utilisateur promu admin !");
    } catch {
      alert("Erreur lors de la promotion");
    } finally {
      setPromoting(null);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Utilisateurs</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Rôle</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.nom}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 font-semibold {user.role === 'admin' ? 'text-green-700' : ''}">{user.role}</td>
              <td className="p-2">
                {user.role !== "admin" && (
                  <button
                    onClick={() => promote(user._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    disabled={promoting === user._id}
                  >
                    {promoting === user._id ? "..." : "Promouvoir admin"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
