import { useState, useEffect } from 'react';
import roomsService from '../services/rooms.service';

const Rooms = ({ isDarkMode }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '' });
  const [editingRoom, setEditingRoom] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await roomsService.getAllRooms();
      setRooms(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.capacity) return;
    try {
      if (editingRoom) {
        await roomsService.updateRoom(editingRoom.id, {
          name: newRoom.name,
          capacity: parseInt(newRoom.capacity)
        });
        setEditingRoom(null);
      } else {
        await roomsService.createRoom({
           name: newRoom.name,
           capacity: parseInt(newRoom.capacity)
        });
      }
      await fetchRooms();
      closeSidebar();
    } catch (error) {
      console.error('Error adding/updating room:', error);
      closeSidebar();
    }
  };

  const handleDeleteRoom = (id) => {
    setRoomToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      await roomsService.deleteRoom(roomToDelete);
      await fetchRooms();
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const openEditSidebar = (room) => {
    setEditingRoom(room);
    setNewRoom({ name: room.name, capacity: room.capacity });
    setShowAddSidebar(true);
  };

  const closeSidebar = () => {
    setShowAddSidebar(false);
    setEditingRoom(null);
    setNewRoom({ name: '', capacity: '' });
  };

  if (loading) return <div className="p-4">Yuklanmoqda...</div>;
  if (error) return <div className="p-4 text-red-500">Xato: {error}</div>;

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Xonalar</h2>
        <button
          onClick={() => setShowAddSidebar(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition"
        >
          + Xona qo'shish
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-500">Xonalar topilmadi</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className={`p-5 border rounded-xl shadow-sm transition-all flex flex-col justify-between ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-100'}`}>
              <div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{room.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Sig'imi: {room.capacity} ta</p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => openEditSidebar(room)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDeleteRoom(room.id)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl transition-transform duration-300 ${showAddSidebar ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>{editingRoom ? 'Xonani tahrirlash' : 'Xonani qo\'shish'}</h2>
          <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
             <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Nomi *</label>
             <input type="text" value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} />
          </div>
          <div>
             <label className={`block text-[13px] font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-[#1e2a4a]'}`}>Sig'imi *</label>
             <input type="number" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-[#0f172a] border-gray-700 text-white' : 'bg-white border-gray-200'}`} />
          </div>
        </div>
        <div className={`p-6 border-t flex justify-end space-x-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={closeSidebar} className="px-5 py-2.5 text-gray-600">Bekor qilish</button>
          <button onClick={handleAddRoom} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">{editingRoom ? 'Saqlash' : 'Qo\'shish'}</button>
        </div>
      </div>
      {showAddSidebar && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={closeSidebar} />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isDarkMode ? 'bg-[#1e293b]' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>
              Siz xonani o'chirishga aminmisiz?
            </h3>
            <div className="flex justify-center gap-4 mt-6">
              <button 
                onClick={cancelDelete} 
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Yo'q
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
