import Modal from './Modal';

export default function DeleteConfirm({ isOpen, onClose, onConfirm, entityName, itemName, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <div className="delete-confirm">
        <div className="delete-confirm-icon">
          <span className="material-symbols-outlined">delete</span>
        </div>
        <h3>Delete {entityName}?</h3>
        <p>Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.</p>
      </div>
    </Modal>
  );
}
