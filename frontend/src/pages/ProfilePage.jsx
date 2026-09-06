import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  const handlePwdChange = (e) => setPwdForm({ ...pwdForm, [e.target.name]: e.target.value })

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMsg({ type: '', text: '' })
    setProfileLoading(true)
    try {
      const res = await authApi.updateProfile(profileForm)
      updateUser({ ...user, ...res.data.data })
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' })
    }
    setProfileLoading(false)
  }

  const handlePwdSubmit = async (e) => {
    e.preventDefault()
    setPwdMsg({ type: '', text: '' })
    if (pwdForm.new_password !== pwdForm.new_password_confirm) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (pwdForm.new_password.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setPwdLoading(true)
    try {
      await authApi.changePassword(pwdForm)
      setPwdMsg({ type: 'success', text: 'Password changed successfully! Please log in again.' })
      setPwdForm({ old_password: '', new_password: '', new_password_confirm: '' })
      setTimeout(logout, 2500)
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' })
    }
    setPwdLoading(false)
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="page-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and security</p>
        </div>

        {/* User Info Banner */}
        <div className="glass-card profile-banner">
          <div className="profile-avatar-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="badge badge-primary" style={{ marginTop: 8 }}>{user?.role}</span>
          </div>
        </div>

        {/* Profile update form */}
        <div className="glass-card profile-section">
          <h3 className="profile-section-title">Personal Information</h3>
          {profileMsg.text && (
            <div className={`alert alert-${profileMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            <div>
              <button
                id="profile-save"
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="glass-card profile-section">
          <h3 className="profile-section-title">Change Password</h3>
          {pwdMsg.text && (
            <div className={`alert alert-${pwdMsg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 20 }}>
              {pwdMsg.text}
            </div>
          )}
          <form onSubmit={handlePwdSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label" htmlFor="old-password">Current Password</label>
              <input
                id="old-password"
                type="password"
                name="old_password"
                className="form-input"
                value={pwdForm.old_password}
                onChange={handlePwdChange}
                required
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  name="new_password"
                  className="form-input"
                  value={pwdForm.new_password}
                  onChange={handlePwdChange}
                  required
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  name="new_password_confirm"
                  className="form-input"
                  value={pwdForm.new_password_confirm}
                  onChange={handlePwdChange}
                  required
                />
              </div>
            </div>
            <div>
              <button
                id="change-password-submit"
                type="submit"
                className="btn btn-danger"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
