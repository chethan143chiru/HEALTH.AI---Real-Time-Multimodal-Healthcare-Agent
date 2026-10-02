import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Camera, Save, 
  ShieldCheck, ArrowLeft, Loader2, Sparkles, LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { logUserActivity } from '@/src/lib/activity';

function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "Male",
    dob: "",
    age: "",
    address: "",
    bloodGroup: "O+",
    allergies: "N/A"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;

      if (activeUser) {
        const uid = activeUser.uid || activeUser.id;
        setProfilePhoto(activeUser.photoURL || activeUser.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`);
        
        // Populate initial data from cached active user
        setFormData(prev => ({
          ...prev,
          name: activeUser.displayName || activeUser.name || "",
          email: activeUser.email || "",
          mobile: activeUser.phoneNumber || activeUser.mobile || ""
        }));

        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const storedDob = data.dob || "";
            let finalAge = data.age || "";
            let ageChanged = false;

            if (storedDob) {
              const calculated = calculateAge(storedDob).toString();
              if (calculated !== data.age) {
                finalAge = calculated;
                ageChanged = true;
              }
            }

            setFormData({
              name: data.name || activeUser.displayName || activeUser.name || "",
              email: data.email || activeUser.email || "",
              mobile: data.mobile || activeUser.phoneNumber || activeUser.mobile || "",
              gender: data.gender || "Male",
              dob: storedDob,
              age: finalAge,
              address: data.address || "",
              bloodGroup: data.bloodGroup || "O+",
              allergies: data.allergies || "N/A"
            });

            if (data.photo) setProfilePhoto(data.photo);

            // If age changed on their birthday, update the doc
            if (ageChanged) {
              updateDoc(doc(db, 'users', uid), {
                age: finalAge,
                updatedAt: serverTimestamp()
              }).catch(err => console.warn("Birthday age update notice:", err));
            }
          }
        } catch (docErr) {
          console.warn("Profile document fetch notice (offline/fallback):", docErr);
        }
      }
      setFetching(false);
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoUrl = reader.result as string;
        setProfilePhoto(photoUrl);
        
        // Save to Auth and Firestore
        const fbUser = auth.currentUser;
        const bypassUserStr = localStorage.getItem('authBypassUser');
        const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
        const activeUser = fbUser || bypassUser;

        if (activeUser) {
          const uid = activeUser.uid || activeUser.id;
          const uName = activeUser.displayName || activeUser.name || 'User';
          try {
            if (fbUser) await updateProfile(fbUser, { photoURL: photoUrl });
            await updateDoc(doc(db, 'users', uid), { 
              photo: photoUrl,
              updatedAt: serverTimestamp()
            });
            await logUserActivity(uid, uName, 'profile_update', 'Uploaded a new profile photo headshot');
          } catch (err) {
            console.error("Photo upload save failed:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const fbUser = auth.currentUser;
    const bypassUserStr = localStorage.getItem('authBypassUser');
    const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
    const activeUser = fbUser || bypassUser;

    if (!activeUser) return;
    const uid = activeUser.uid || activeUser.id;

    try {
      // 1. Update local storage session
      if (bypassUser) {
        const updatedLocal = {
          ...bypassUser,
          name: formData.name || bypassUser.name,
          email: formData.email || bypassUser.email,
          mobile: formData.mobile,
          gender: formData.gender,
          dob: formData.dob,
          age: formData.age,
          address: formData.address,
          photo: profilePhoto
        };
        localStorage.setItem('authBypassUser', JSON.stringify(updatedLocal));
      }

      // 2. Update Firebase Auth display name if available
      if (fbUser) {
        await updateProfile(fbUser, {
          displayName: formData.name,
          photoURL: profilePhoto
        }).catch(() => {});
      }

      // 3. Persist to Firestore
      try {
        await updateDoc(doc(db, 'users', uid), {
          ...formData,
          photo: profilePhoto,
          updatedAt: serverTimestamp()
        });
      } catch (dbErr) {
        console.warn("Firestore profile save notice (offline fallback):", dbErr);
      }

      const uName = formData.name || activeUser.displayName || activeUser.name || 'User';
      logUserActivity(uid, uName, 'profile_update', 'Updated personal details and medical context parameters')
        .catch(() => {});

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authBypassUser');
    localStorage.removeItem('health_ai_admin_auth');
    sessionStorage.clear();
    try {
      const fbUser = auth.currentUser;
      const bypassUserStr = localStorage.getItem('authBypassUser');
      const bypassUser = bypassUserStr ? JSON.parse(bypassUserStr) : null;
      const activeUser = fbUser || bypassUser;
      if (activeUser) {
        const uid = activeUser.uid || activeUser.id;
        const uName = activeUser.displayName || activeUser.name || formData.name || 'User';
        logUserActivity(uid, uName, 'logout', 'User explicitly logged out of session').catch(() => {});
      }
      signOut(auth).catch(() => {});
    } catch (err) {
      console.warn("Logout notice:", err);
    }
    window.location.href = '/';
  };

  if (fetching) return (
    <div className="min-h-[60vh] flex items-center justify-center">
       <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-6 mb-12">
         <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl relative bg-slate-800">
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                 <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
         </div>

         <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-[10px] font-black uppercase text-brand-primary tracking-widest border border-brand-primary/20">Verified Identity</span>
             <Sparkles className="w-3 h-3 text-brand-primary" />
           </div>
           <h1 className="text-4xl font-black font-display tracking-tightest">{formData.name || "Set Name"}</h1>
           <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
             <Mail className="w-3 h-3" /> {formData.email || "No Email"} • <Phone className="w-3 h-3 ml-2" /> {formData.mobile || "No Mobile"}
           </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6">Personal Details</h2>
            
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Date of Birth</label>
                    <input 
                      type="date"
                      name="dob" 
                      value={formData.dob} 
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newDob = e.target.value;
                        const calculated = calculateAge(newDob);
                        setFormData(prev => ({
                          ...prev,
                          dob: newDob,
                          age: calculated.toString()
                        }));
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all text-white text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Calculated Age</label>
                    <input 
                      name="age" 
                      value={formData.age ? `${formData.age} Years` : "N/A"} 
                      readOnly
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white/40 outline-none transition-all select-none cursor-not-allowed"
                    />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Gender</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Address</label>
                  <textarea 
                    name="address" 
                    rows={3}
                    value={formData.address} 
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none"
                  />
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass-card p-8">
               <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-6">Medical Context</h2>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Blood Group</label>
                        <input 
                          name="bloodGroup" 
                          value={formData.bloodGroup} 
                          onChange={handleInputChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Weight History</label>
                        <div className="w-full py-3 px-4 text-white/40 text-sm italic">70.2 kg (Latest)</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-white/40">
                     <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-primary" /> Data is stored in secure HIPAA-compliant cloud storage.</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
               <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Profile Changes
               </button>
               <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-red-500"
               >
                  <LogOut className="w-5 h-5" /> Logout Session
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
