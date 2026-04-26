import { Link } from 'react-router-dom'
import {
  BookOpen, Upload, Shield, Star, Users, Download,
  ArrowRight, Cpu, Zap, Wrench, Radio, Building2, Laptop
} from 'lucide-react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

const branches = [
  { name: 'Computer Science Engineering', code: 'CSE', icon: Cpu, color: 'from-blue-500 to-cyan-500', desc: '6 Semesters • 40+ Subjects' },
  { name: 'Mechanical Engineering',       code: 'ME',  icon: Wrench, color: 'from-orange-500 to-amber-500', desc: '6 Semesters • 38+ Subjects' },
  { name: 'Electrical Engineering',       code: 'EE',  icon: Zap, color: 'from-yellow-500 to-orange-500', desc: '6 Semesters • 36+ Subjects' },
  { name: 'Civil Engineering',            code: 'CE',  icon: Building2, color: 'from-slate-500 to-slate-700', desc: '6 Semesters • 35+ Subjects' },
  { name: 'Electronics & Communication',  code: 'EC',  icon: Radio, color: 'from-purple-500 to-pink-500', desc: '6 Semesters • 37+ Subjects' },
  { name: 'Information Technology',       code: 'IT',  icon: Laptop, color: 'from-emerald-500 to-teal-500', desc: '6 Semesters • 38+ Subjects' },
]

const features = [
  { icon: BookOpen, title: 'Unit-wise Notes', desc: 'Every subject broken down by unit — find exactly what you need in seconds.' },
  { icon: Star, title: 'Important Questions', desc: 'Curated important questions and PYQ for every subject and unit.' },
  { icon: Upload, title: 'Student Uploads', desc: 'Upload your notes and study materials. Help your batchmates.' },
  { icon: Shield, title: 'Admin Verified', desc: 'All materials reviewed and approved by admin before going live.' },
  { icon: Download, title: 'Free Downloads', desc: 'Download PDFs, question papers, and notes for free, anytime.' },
  { icon: Users, title: 'Community Driven', desc: 'Built by students, for students of GPC Waidhan.' },
]

const stats = [
  { value: '500+', label: 'Study Materials' },
  { value: '6',    label: 'Branches' },
  { value: '36',   label: 'Semesters' },
  { value: '200+', label: 'Students Active' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="hero-gradient hero-pattern text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Government Polytechnic College Waidhan</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-5">
              Student Resource
              <span className="block text-sky-300">Portal</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
              Your one-stop academic hub. Access notes, PYQ, important questions, and syllabus — organized by branch, semester, subject, and unit.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/resources" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                <BookOpen className="w-5 h-5" />
                Explore Resources
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/25 transition-all active:scale-[0.98]">
                <Upload className="w-5 h-5" />
                Upload Materials
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/15 bg-white/10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold font-display text-white">{s.value}</p>
                  <p className="text-sm text-blue-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-display text-slate-800 mb-3">Browse by Branch</h2>
          <p className="text-slate-500">Select your branch to find semester-wise, unit-wise study material</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map(b => {
            const Icon = b.icon
            return (
              <Link
                key={b.code}
                to={`/resources?branch=${b.code}`}
                className="card-hover group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 font-display mb-1 group-hover:text-primary-700 transition-colors">{b.name}</h3>
                <p className="text-sm text-slate-500">{b.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-primary-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Materials <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-slate-800 mb-3">Everything You Need</h2>
            <p className="text-slate-500">Designed specifically for RGPV polytechnic students</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card hover:shadow-card-hover transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 font-display">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="card bg-gradient-to-br from-primary-600 to-sky-600 text-white">
          <h2 className="text-2xl font-bold font-display mb-3">Start Contributing Today</h2>
          <p className="text-blue-100 mb-6 text-sm">
            Create a free account and upload your notes, question papers, and study materials to help your fellow students.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-all inline-flex items-center gap-2">
              <Users className="w-4 h-4" /> Register Free
            </Link>
            <Link to="/login" className="bg-white/20 border border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/30 transition-all inline-flex items-center gap-2">
              Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
