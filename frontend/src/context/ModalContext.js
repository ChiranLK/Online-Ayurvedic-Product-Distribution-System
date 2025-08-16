import React, { createContext, useState, useContext } from 'react';
import Modal from '../components/common/Modal';

// Create a context for the modal
const ModalContext = createContext();

// Provider component that will wrap your app
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: '',
    onConfirm: null,
    type: 'info',
  });

  // Function to open the modal with given parameters
  const openModal = ({
    title = '',
    message = '',
    confirmText = 'OK',
    cancelText = '',
    onConfirm = null,
    type = 'info',
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      type,
    });
  };

  // Function to close the modal
  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        type={modalState.type}
      />
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => useContext(ModalContext);
