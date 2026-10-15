import Swal from 'sweetalert2';

export const appAlert = Swal.mixin({
  background: '#ffffff',
  color: '#0f172a',
  confirmButtonColor: '#2563eb',
  cancelButtonColor: '#e2e8f0',
  customClass: {
    popup: 'healthplus-alert-popup',
    title: 'healthplus-alert-title',
    htmlContainer: 'healthplus-alert-text',
    confirmButton: 'healthplus-alert-confirm',
    cancelButton: 'healthplus-alert-cancel',
    closeButton: 'healthplus-alert-close',
    icon: 'healthplus-alert-icon',
  },
  showCloseButton: true,
  buttonsStyling: false,
});
