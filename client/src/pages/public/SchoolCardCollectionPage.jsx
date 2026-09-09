import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CreditCard,
  Camera,
  Upload,
  CheckCircle2,
  Users,
  Plus,
  RefreshCw,
  Sparkles,
  School,
  Building,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export default function SchoolCardCollectionPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [currentStudentNum, setCurrentStudentNum] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  // Project / School Branding State
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'DPS Public School',
    session: '2026-2027',
    client: 'DPS School',
    logo: null
  });

  // Current Student Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' | 'environment'
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Could not access camera. Please allow camera permissions or upload from gallery.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoDataUrl(dataUrl);
    stopCamera();
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save Current Student & Reset Form for Next
  const handleSaveAndNext = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter student name');
      return;
    }
    if (!rollNumber.trim()) {
      alert('Please enter roll number or student ID');
      return;
    }

    setSubmitting(true);
    // Simulate / Save student record
    setTimeout(() => {
      setSubmittedCount((c) => c + 1);
      setCurrentStudentNum((n) => n + 1);
      setSuccessMsg(`✓ Saved ${name} (Roll #${rollNumber})`);
      setTimeout(() => setSuccessMsg(''), 3000);

      // Reset form
      setName('');
      setRollNumber('');
      setFatherName('');
      setDob('');
      setPhone('');
      setAddress('');
      setPhotoDataUrl(null);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  // Finalize Batch & Lock
  const handleFinalizeBatch = () => {
    if (submittedCount === 0 && !name.trim()) {
      alert('Please enter at least 1 student before finalizing the batch.');
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to finalize and submit ${submittedCount + (name ? 1 : 0)} student cards to the studio? The data will be locked for printing.`
      )
    ) {
      if (name.trim()) {
        setSubmittedCount((c) => c + 1);
      }
      setIsLocked(true);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/40 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Batch Submitted & Locked!</h2>
            <p className="text-xs text-slate-400 mt-1">
              {submittedCount} Student ID card records have been securely submitted to the printing studio.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2 font-mono">
            <Lock size={14} className="text-emerald-400" />
            <span>Status: Ready for 300 DPI Printing</span>
          </div>
          <p className="text-[11px] text-slate-500">
            If you need to make any corrections, please contact your CSC / Studio operator directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center py-6 px-4">
      {/* Container */}
      <div className="w-full max-w-xl space-y-5">
        {/* School Branding Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold overflow-hidden shrink-0">
              <School size={24} />
            </div>
            <div className="truncate">
              <h1 className="text-base font-extrabold text-white truncate">{schoolInfo.name}</h1>
              <p className="text-xs text-cyan-400 font-medium truncate">
                Session {schoolInfo.session} • ID Card Data Collection
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono">
              #{submittedCount} Done
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Student Data Entry Form */}
        <form onSubmit={handleSaveAndNext} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {currentStudentNum}
              </span>
              <span>Student Details</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Auto-Saving</span>
          </div>

          {/* Photo Capture & Upload Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Student Photo *</label>
            
            {cameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-cyan-500/50 aspect-square max-w-[280px] mx-auto shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Face Alignment Oval */}
                <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 rounded-full m-8 pointer-events-none" />

                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 px-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={15} />
                    <span>Click Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-900/90 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-24 h-28 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {photoDataUrl ? (
                    <img src={photoDataUrl} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={28} className="text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Camera size={15} />
                    <span>Take Photo (Camera)</span>
                  </button>

                  <label className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload size={14} />
                    <span>Upload from Gallery</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Roll No / Student ID *</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 1045"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Class & Section</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Class 10-A"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Date of Birth (DOB)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Emergency Mobile / Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Plus size={18} />
              <span>{submitting ? 'Saving Student...' : 'Save & Add Next Student ➔'}</span>
            </button>

            {submittedCount > 0 && (
              <button
                type="button"
                onClick={handleFinalizeBatch}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock size={14} />
                <span>Finalize & Submit Batch ({submittedCount} Students)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
