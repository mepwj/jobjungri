"use client";

interface Item {
  id: string;
  name: string;
  description: string;
}

import { useState, useEffect } from "react";

export default function TestPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 전체 데이터 불러오기
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/test");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 항목 추가 처리
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        fetchItems();
      } else {
        console.error("Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  // 항목 삭제 처리
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/test", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchItems();
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // 수정 시작
  const startEdit = (item: Item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditDescription("");
  };

  // 항목 수정 처리
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editName.trim() || !editDescription.trim()) return;
    try {
      const res = await fetch("/api/test", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editName,
          description: editDescription,
        }),
      });
      if (res.ok) {
        cancelEdit();
        fetchItems();
      } else {
        console.error("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">테스트 페이지</h1>

      {/* 항목 추가 폼 */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <h2 className="text-xl font-semibold mb-2">새 아이템 추가</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          추가
        </button>
      </form>

      {/* 항목 목록 */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">아이템 목록</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">아이템이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="border border-gray-200 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                {editId === item.id ? (
                  <form
                    onSubmit={handleUpdate}
                    className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 mb-2 md:mb-0 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 mb-2 md:mb-0 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
