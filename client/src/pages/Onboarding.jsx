import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Heart, UserPlus, Trash, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/resources';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bloodGroup: '',
    phone: '',
    medicalConditions: '',
  });

  // Emergency contacts state
  const [contacts, setContacts] = useState([
    { name: '', phone: '', relation: '' }
  ]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        age: user.age || '',
        bloodGroup: user.bloodGroup || '',
        phone: user.phone || '',
        medicalConditions: user.medicalConditions?.join(', ') || '',
      });
      if (user.emergencyContacts?.length > 0) {
        setContacts(user.emergencyContacts);
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index, e) => {
    const updated = [...contacts];
    updated[index][e.target.name] = e.target.value;
    setContacts(updated);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', phone: '', relation: '' }]);
  };

  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated.length ? updated : [{ name: '', phone: '', relation: '' }]);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.age || !profile.bloodGroup) {
      return toast.error('Please complete all required fields.');
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check emergency contacts validation
    const invalid = contacts.some(c => !c.name || !c.phone || !c.relation);
    if (invalid) {
      return toast.error('Please fill out all emergency contact fields or remove unused ones.');
    }

    setLoading(true);
    try {
      // 1. Save profile
      const parsedMedical = profile.medicalConditions
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const profileResponse = await userApi.updateMe({
        name: profile.name,
        age: parseInt(profile.age),
        bloodGroup: profile.bloodGroup,
        phone: profile.phone,
        medicalConditions: parsedMedical,
      });

      // 2. Save emergency contacts
      await userApi.updateEmergencyContacts(contacts);

      // 3. Update local auth context user info
      updateUser({
        ...profileResponse.data.data,
        emergencyContacts: contacts,
        onboardingComplete: true
      });

      toast.success('Clearance profile established successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update credentials profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-4 relative z-10 px-4">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">SafeGuard AI</span>
        </div>
        <h2 className="text-3xl font-display font-bold">Clearance telemetry profile</h2>
        <p className="text-white/40 text-sm">
          Set up critical health profile and emergency contacts to enable swift assistance
        </p>

        {/* Progress indicators */}
        <div className="flex justify-center items-center gap-4 pt-2">
          <div className={`h-1.5 w-16 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-500' : 'bg-white/10'}`} />
          <div className={`h-1.5 w-16 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-500' : 'bg-white/10'}`} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNext}
                className="space-y-6"
              >
                <h3 className="text-lg font-display font-semibold flex items-center gap-2 border-b border-white/5 pb-3">
                  <User size={18} className="text-blue-400" /> Personal Telemetry
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="input-field"
                      placeholder="Rahul Sharma"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleProfileChange}
                      className="input-field"
                      placeholder="28"
                      min="1"
                      max="150"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={profile.bloodGroup}
                      onChange={handleProfileChange}
                      className="input-field appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">
                    Medical Conditions (comma-separated)
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={profile.medicalConditions}
                    onChange={handleProfileChange}
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Asthma, Penicillin Allergy, Heart Murmur..."
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth icon={ArrowRight}>
                  Proceed to Emergency Contacts
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                    <Heart size={18} className="text-red-400" /> Emergency Contacts
                  </h3>
                  <button
                    type="button"
                    onClick={addContact}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono font-medium"
                  >
                    <UserPlus size={14} /> Add Contact
                  </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {contacts.map((contact, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4 relative">
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="absolute top-4 right-4 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={contact.name}
                            onChange={(e) => handleContactChange(index, e)}
                            className="input-field py-2 px-3 text-sm"
                            placeholder="Priya Sharma"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={contact.phone}
                            onChange={(e) => handleContactChange(index, e)}
                            className="input-field py-2 px-3 text-sm"
                            placeholder="+919876543211"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Relation</label>
                          <input
                            type="text"
                            name="relation"
                            value={contact.relation}
                            onChange={(e) => handleContactChange(index, e)}
                            className="input-field py-2 px-3 text-sm"
                            placeholder="Wife"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    icon={ArrowLeft}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    icon={ArrowRight}
                  >
                    Finish Profile Registration
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding;
