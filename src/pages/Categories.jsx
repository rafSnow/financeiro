import { useEffect, useState } from 'react';
import { FiAlertCircle, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import CategoryForm from '../components/CategoryForm';
import Header from '../components/Header';
import {
  createCategory,
  deleteCategory,
  getCategories,
  initDefaultCategories,
  updateCategory,
} from '../services/categories.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function Categories() {
  const { user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCategories(user.uid);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      addToast('Erro ao carregar categorias', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInitDefaults = async () => {
    try {
      setLoading(true);
      await initDefaultCategories(user.uid);
      await loadCategories();
      addToast('Categorias padrão criadas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao inicializar categorias:', error);
      addToast('Erro ao criar categorias padrão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async data => {
    try {
      await createCategory(user.uid, data);
      await loadCategories();
      setIsFormOpen(false);
      addToast('Categoria criada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      addToast('Erro ao criar categoria', 'error');
    }
  };

  const handleUpdate = async data => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, data);
      await loadCategories();
      setEditingCategory(null);
      setIsFormOpen(false);
      addToast('Categoria atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      addToast('Erro ao atualizar categoria', 'error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories();
      addToast('Categoria excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      addToast('Erro ao excluir categoria', 'error');
    }
  };

  const handleEdit = category => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleSubmit = data => {
    if (editingCategory) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
        <Header />
        <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const hasDefaultCategories = categories.some(cat => cat.isDefault);
  const customCategories = categories.filter(cat => !cat.isDefault);
  const defaultCategories = categories.filter(cat => cat.isDefault);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      <Header />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Cabeçalho da página */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie suas categorias de despesas
              </p>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Nova Categoria</span>
            </button>
          </div>
        </div>

        {/* Aviso se usar categorias padrão */}
        {hasDefaultCategories && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3">
            <FiAlertCircle className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" size={20} />
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                Usando Categorias Padrão
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Você está usando as categorias padrão do sistema. Clique no botão abaixo para salvar
                suas próprias categorias e poder editá-las.
              </p>
              <Button onClick={handleInitDefaults} variant="secondary" className="mt-3 text-sm">
                Salvar Categorias Padrão
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Categorias */}
        <div className="space-y-6">
          {/* Categorias Personalizadas */}
          {customCategories.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Minhas Categorias
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customCategories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Categorias Padrão */}
          {defaultCategories.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categorias Padrão
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {defaultCategories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDefault
                  />
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Nenhuma categoria encontrada</p>
              <Button onClick={() => setIsFormOpen(true)}>Criar Primeira Categoria</Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal do Formulário */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingCategory}
      />
    </div>
  );
}

function CategoryCard({ category, onEdit, onDelete, isDefault = false }) {
  return (
    <div
      className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
      style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <category.icon className="text-3xl" style={{ color: category.color }} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {category.type === 'fixed' ? 'Fixa' : 'Variável'}
            </span>
          </div>
        </div>

        {!isDefault && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
              title="Editar"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              title="Excluir"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {category.budgetLimit > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Limite:{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              R$ {category.budgetLimit.toFixed(2)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
