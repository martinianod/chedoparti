import { useModal } from '../context/UIContext.jsx';

// 🎯 Ejemplo de uso de modales globales con el nuevo UIContext
export function ExampleModalDemo() {
  const confirmModal = useModal('confirm-delete');
  const infoModal = useModal('user-info');

  const handleDeleteAction = () => {
    confirmModal.show({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este elemento?',
      onConfirm: () => {
        confirmModal.hide();
      },
      onCancel: () => {
        confirmModal.hide();
      },
    });
  };

  const handleShowUserInfo = () => {
    infoModal.show({
      title: 'Información del Usuario',
      userData: { name: 'Juan Pérez', email: 'juan@example.com' },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Demo de Modales Globales</h2>

      <div className="space-x-4">
        <button
          onClick={handleDeleteAction}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Eliminar Elemento
        </button>

        <button
          onClick={handleShowUserInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ver Info Usuario
        </button>
      </div>

      {/* Modal de confirmación */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{confirmModal.props.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmModal.props.message}</p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={confirmModal.props.onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.props.onConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de información */}
      {infoModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{infoModal.props.title}</h3>
            <div className="space-y-2 mb-6">
              <p>
                <strong>Nombre:</strong> {infoModal.props.userData?.name}
              </p>
              <p>
                <strong>Email:</strong> {infoModal.props.userData?.email}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => infoModal.hide()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExampleModalDemo;
