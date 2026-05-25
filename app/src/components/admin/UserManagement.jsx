import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { useSession } from '../utils/session-service';
import AuthContext from '../../context/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const { controleur } = useSession();
  const { updateControleur } = useContext(AuthContext);
  const isAdmin = controleur && controleur.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    laboname: '',
    email: '',
    role: 'tester',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setError(new Error('Unexpected API response format'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm(t('admin_panel.confirm_delete_user'))) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError(err);
        alert(t('admin_panel.delete_user_error'));
      }
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormValues({ username: '', password: '', laboname: '', email: '', role: 'tester' });
    setShowAddEditModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormValues({ username: user.username, password: '', laboname: user.laboname, email: user.email, role: user.role });
    setShowAddEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const { password, ...rest } = formValues;
      let dataToSend = isAdmin ? rest : { ...rest, role: undefined };
      if (!editingUser) {
        // Password must contain at least 4 digits
        const digitCount = (password.match(/\d/g) || []).length;
        if (digitCount < 4) {
          alert('Le mot de passe doit contenir au moins 4 chiffres.');
          return;
        }
        dataToSend.password = password;
      }

      let updatedUser;
      if (editingUser) {
        const response = await api.put(`/users/${editingUser.id}`, dataToSend);
        updatedUser = response.data;
        if (controleur.id === editingUser.id) {
          updateControleur(updatedUser);
        }
      } else {
        await api.post('/users', dataToSend);
      }
      setShowAddEditModal(false);
      fetchUsers();
    } catch (err) {
      setError(err);
      alert(t('admin_panel.save_user_error'));
    }
  };

  const translateRole = (role) => {
    switch (role) {
      case 'tester': return t('admin_panel.role_tester');
      case 'quality_control': return t('admin_panel.role_quality_control');
      case 'printer': return t('admin_panel.role_printer');
      case 'admin': return t('admin_panel.role_admin');
      case 'apro': return t('admin_panel.role_apro');
      default: return role;
    }
  };

  if (loading) return <div>{t('admin_panel.loading_users')}</div>;
  if (error) return <div>{t('admin_panel.error_loading_users')}: {error.message}</div>;

  return (
    <div className="user-management-container">
      <h2>{t('admin_panel.user_management')}</h2>
      <button onClick={handleAddUser} className="add-user-button">
        {t('admin_panel.add_new_user')}
      </button>

      <table>
        <thead>
          <tr>
            <th>{t('admin_panel.username')}</th>
            <th>{t('admin_panel.laboname')}</th>
            <th>{t('admin_panel.email')}</th>
            <th>{t('admin_panel.role')}</th>
            <th>{t('admin_panel.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.laboname}</td>
              <td>{user.email}</td>
              <td>{translateRole(user.role)}</td>
              <td>
                <button onClick={() => handleEditUser(user)} className="edit-button">{t('admin_panel.edit')}</button>
                <button onClick={() => handleDelete(user.id)} className="delete-button">{t('admin_panel.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingUser ? t('admin_panel.edit_user') : t('admin_panel.add_new_user')}</h3>
            <form onSubmit={handleFormSubmit}>
              <label>
                {t('admin_panel.username')}:
                <input type="text" name="username" value={formValues.username} onChange={handleFormChange} required />
              </label>
              {!editingUser && (
                <label>
                  {t('admin_panel.password')}:
                  <input type="password" name="password" value={formValues.password} onChange={handleFormChange} required />
                  <small style={{ color: 'rgba(255,255,255,0.6)', marginTop: '4px', display: 'block' }}>
                    Le mot de passe doit contenir au moins 4 chiffres.
                  </small>
                </label>
              )}
              <label>
                {t('admin_panel.laboname')}:
                <input type="text" name="laboname" value={formValues.laboname} onChange={handleFormChange} required />
              </label>
              <label>
                {t('admin_panel.email')}:
                <input type="email" name="email" value={formValues.email} onChange={handleFormChange} required />
              </label>
              <label>
                {t('admin_panel.role')}:
                <select name="role" value={formValues.role} onChange={handleFormChange} disabled={!isAdmin}>
                  <option value="tester">{t('admin_panel.role_tester')}</option>
                  <option value="quality_control">{t('admin_panel.role_quality_control')}</option>
                  <option value="printer">{t('admin_panel.role_printer')}</option>
                  <option value="apro">{t('admin_panel.role_apro')}</option>
                  <option value="admin">{t('admin_panel.role_admin')}</option>
                </select>
              </label>
              <button type="submit">{t('admin_panel.save')}</button>
              <button type="button" onClick={() => setShowAddEditModal(false)}>{t('admin_panel.cancel')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;