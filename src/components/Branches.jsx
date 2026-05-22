const Branches = ({ isDarkMode }) => {
  // Static Demo Data as requested
  const branches = [
    {
      id: 1,
      name: 'Chilonzor Filiali',
      address: 'Chilonzor tumani, Qatortol ko\'chasi, 19-uy',
      phone: '+998 99 123 45 67',
      studentsCount: 345,
      teachersCount: 15,
      capacity: 500,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      status: 'active'
    },
    {
      id: 2,
      name: 'Yunusobod Filiali',
      address: 'Yunusobod tumani, Amir Temur ko\'chasi, 108-A',
      phone: '+998 90 987 65 43',
      studentsCount: 210,
      teachersCount: 10,
      capacity: 350,
      image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?auto=format&fit=crop&q=80&w=800',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sergeli Filiali (Tez kunda)',
      address: 'Sergeli tumani, Yangi Sergeli yo\'li',
      phone: '+998 71 200 00 00',
      studentsCount: 0,
      teachersCount: 0,
      capacity: 400,
      image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
      status: 'upcoming'
    }
  ];

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e2a4a]'}`}>Filiallar (Demo)</h2>
          <p className="text-sm text-gray-500 mt-1">Ushbu bo'lim faqat demo rejimida ishlamoqda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className={`rounded-2xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'bg-[#1e293b] border-gray-700 shadow-lg shadow-black/20' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="h-40 overflow-hidden relative">
              <img src={branch.image} alt={branch.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              {branch.status === 'upcoming' && (
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Tez kunda
                </div>
              )}
              {branch.status === 'active' && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Faol
                </div>
              )}
              <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">{branch.name}</h3>
            </div>
            
            <div className="p-5">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{branch.address}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{branch.phone}</p>
              </div>
              
              <div className={`grid grid-cols-3 gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="text-center">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-1 font-bold">Talabalar</p>
                  <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>{branch.studentsCount}</p>
                </div>
                <div className="text-center border-x border-gray-100 dark:border-gray-700">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-1 font-bold">O'qituvchi</p>
                  <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>{branch.teachersCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-1 font-bold">Sig'im</p>
                  <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>{branch.capacity}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;
