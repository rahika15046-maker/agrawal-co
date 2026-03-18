'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/Spinner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to Agrawal.co');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="block text-center font-display text-2xl font-bold text-primary-600 mb-6">
          Agrawal.co
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Join thousands of happy shoppers</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Agrawal' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone (optional)', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={set(key)} className="input" placeholder={placeholder} required={key !== 'phone'} />
            </div>
          ))}
          <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading && <Spinner size="sm" />}
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
