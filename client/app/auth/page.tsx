/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { API } from '@/lib/api';

const loginSchema = z.object({
  user: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور قصيرة جداً'),
});

const registerSchema = z
  .object({
    user: z.string().min(3, 'اسم المستخدم مطلوب'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      route.push('/session');
    }
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, data);

      localStorage.setItem('token', res.data.AccessToken);

      setTimeout(() => {
        route.push('/session');
      }, 5000);
    } catch (err : any) {
      toast.error(err.response?.data?.error || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const { confirmPassword, ...sendData } = data;
      await axios.post(`${API}/api/auth/register`, sendData);
      toast.success('Account created! Please login.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-black">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.25), transparent 70%), #000000',
        }}
      />
      <div
        className="flex justify-center items-center flex-col min-h-screen  p-4 relative z-10"
        style={{ zIndex: 99999 }}
      >
        <h1 className="text-4xl font-bold mb-[120px] fixed top-[150px]">
          سجل الدخول مجانا للبدأ FREE
        </h1>
        <Tabs defaultValue="login" className="w-full md:w-1/2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">انشاء حساب</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card dir="rtl">
              <CardHeader>
                <CardTitle>مرحبا بعدوتك</CardTitle>
                <CardDescription>سجل الدخول للاستمرار</CardDescription>
              </CardHeader>
              <form onSubmit={loginForm.handleSubmit(onLogin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>اسم المستخدم</Label>
                    <Input {...loginForm.register('user')} placeholder="اسم المستخدم" />
                    {loginForm.formState.errors.user && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.user.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>كلمة السر</Label>
                    <Input {...loginForm.register('password')} type="كلمة السر" />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full mt-3" type="submit" disabled={loading}>
                    {loading ? 'جاري التسجيل...' : 'تسجيل '}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card dir="rtl">
              <CardHeader>
                <CardTitle>انشاء حساب</CardTitle>
                <CardDescription>انضم الينا مجانا عبر انشاء حساب مجاني تماما</CardDescription>
              </CardHeader>
              <form onSubmit={registerForm.handleSubmit(onRegister)}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>اسم المستخدم</Label>
                    <Input {...registerForm.register('user')} placeholder="انشاء حساب" />
                    {registerForm.formState.errors.user && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.user.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>كلمة السر</Label>
                    <Input {...registerForm.register('password')} type="تأكيد كلمة السر" />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>تأكيد كلمة السر</Label>
                    <Input {...registerForm.register('confirmPassword')} type="كلمة السر" />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full mt-3" type="submit" disabled={loading}>
                    {loading ? 'جاري الانشاء...' : 'انشاء حساب'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>{' '}
    </div>
  );
};

export default Auth;
