"use client"

import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { API } from '@/lib/api'
import NavButtons from '@/components/global/nav-buttons'
import Header from '@/components/global/header'

const formSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون أكثر من 3 أحرف").max(50),
  description: z.string().min(5, "الوصف قصير جداً").max(200),
  subject_id: z.string().uuid("معرف المادة غير صحيح"),
  UserId: z.string(),
})

const NewMap = () => {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject_id: "", 
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await axios.post(`${API}/api/books`, values)
      
      if (response.status === 201 || response.status === 200) {
        toast.success("تم إنشاء المسار بنجاح!")
        form.reset()
      }
    } catch (error) {
      toast.error("خطأ في الاتصال")
    } finally {
      setIsLoading(false)
    }
  }

  return (
   <div>
      <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#0a0a0a',
          backgroundImage: `
       radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
       radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
     `,
          backgroundSize: '10px 10px',
          imageRendering: 'pixelated',
        }}
      />
      <div className="min-h-screen bg-black/5 relative flex justify-center items-center flex-col z-50">
        <div className='border fixed top-0 w-full '>
          <Header />
        </div>
     <div className=" w-[90%] md:w-1/3 mx-auto p-6 border rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-6 h-6" />
        <h2 className="text-xl font-bold tracking-tight">إنشاء خريطة دراسية جديدة</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stone-300">عنوان الجلسة / الكتاب</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="مثلاً: مراجعة الميكانيك الشاملة" 
                    className="  text-white focus:ring-orange-600" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-stone-300">الوصف</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="اكتب تفاصيل مختصرة عن محتوى هذه الخريطة..." 
                    className="text-white min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full  text-white transition-all font-bold py-6 shadow-lg shadow-orange-950/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <Plus />
            )}
          </Button>
        </form>
      </Form>
    </div>

        <div className='border fixed bottom-0 w-full md:hidden'>
          <NavButtons />
        </div>
      </div>
    </div>
   </div>
  )
}

export default NewMap