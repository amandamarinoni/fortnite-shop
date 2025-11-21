import { useState, useEffect } from 'react';
import axios from 'axios';
import {LogOut, Store, RefreshCw } from 'lucide-react';

// --- CONFIGURAÇÃO ---
const API_URL = 'http://localhost:4002'; // A porta do Backend

// --- TIPOS ---
interface UserData {
  id: string;
  displayName: string;
  balance: number;
  token: string;
}

interface Cosmetic {
  id: string;
  name: string;
  description: string;
  priceVbucks: number;
  imageUrl: string | null;
  rarity: string;
  isNew: boolean;
}

function App() {
  // Estados
  const [user, setUser] = useState<UserData | null>(null);
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [view, setView] = useState<'login' | 'register' | 'shop'>('login');
  
  // Formulários
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // --- AÇÕES DE API ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setUser(res.data);
      setView('shop');
      fetchShop(); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro no login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/register`, { 
        email, 
        password, 
        displayName: name 
      });
      alert("Conta criada! Ganhou 10.000 V-Bucks. Faça login agora.");
      setView('login');
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro no cadastro");
    } finally {
      setLoading(false);
    }
  };

  const fetchShop = async () => {
    try {
      const res = await axios.get(`${API_URL}/shop`);
      setItems(res.data);
    } catch (error) {
      console.error("Erro ao carregar loja", error);
    }
  };

  const handleSync = async () => {
    if (!confirm("Deseja atualizar a loja com dados da API do Fortnite?")) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/sync`);
      alert(`Sincronização concluída! ${res.data.count} itens encontrados.`);
      fetchShop();
    } catch (error) {
      alert("Erro ao sincronizar");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (cosmeticId: string, price: number) => {
    if (!user) return;
    if (user.balance < price) return alert("Saldo insuficiente!");

    if (!confirm(`Confirmar compra por ${price} V-Bucks?`)) return;

    try {
      const res = await axios.post(`${API_URL}/shop/buy`, {
        userId: user.id,
        cosmeticId
      });
      
      alert(res.data.message || "Compra realizada!");
      setUser({ ...user, balance: res.data.remainingBalance });
      
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro na compra");
    }
  };

  // --- RENDERIZAÇÃO ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black italic text-yellow-400 mb-2">FN STORE</h1>
            <p className="text-slate-400">Entre para gastar seus V-Bucks</p>
          </div>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Nome</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-yellow-400" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Email</label>
              <input type="email" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-yellow-400" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Senha</label>
              <input type="password" className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none focus:border-yellow-400" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black py-4 rounded text-lg transition-transform active:scale-95 disabled:opacity-50">
              {loading ? 'CARREGANDO...' : (view === 'login' ? 'ENTRAR' : 'CRIAR CONTA')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-slate-400 hover:text-white text-sm underline">
              {view === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="text-yellow-400" size={32} />
            <h1 className="text-2xl font-black italic tracking-tighter">FN<span className="text-yellow-400">STORE</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
              <img src="https://fortnite-api.com/images/vbuck.png" alt="V" className="w-6 h-6" />
              <span className="font-bold text-xl text-white">{user.balance.toLocaleString()}</span>
            </div>
            <button onClick={() => setUser(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic">Destaques</h2>
            <p className="text-slate-400">Loja atualizada</p>
          </div>
          <button onClick={handleSync} disabled={loading} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm font-bold transition-colors border border-slate-700">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-yellow-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              {item.isNew && <div className="absolute top-0 left-0 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1 rounded-br-lg z-10">NOVO</div>}
              <div className="aspect-square bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
                 {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-2xl z-10 group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-slate-500">Sem Imagem</span>
                  )}
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-bold text-lg truncate">{item.name}</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{item.rarity}</p>
                </div>
                <button onClick={() => handleBuy(item.id, item.priceVbucks)} className="w-full bg-white hover:bg-yellow-400 text-slate-900 font-black py-3 rounded flex items-center justify-center gap-2 transition-colors">
                  <img src="https://fortnite-api.com/images/vbuck.png" alt="V" className="w-4 h-4" />
                  {item.priceVbucks}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;