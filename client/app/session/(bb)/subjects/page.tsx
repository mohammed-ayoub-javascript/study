"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { API } from "@/lib/api"
import { BookOpen, Loader2, ChevronLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Subject {
  ID: string;
  Title: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter()

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem("token")
      try {
        const response = await axios.get(`${API}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSubjects(response.data)
        console.log(response.data)
      } catch (error) {
        toast.error("فشل في تحميل المواد")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto z-10 relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-primary" />
          موادي الدراسية
        </h1>
        <div className="flex justify-center items-center flex-row gap-3">
            <span className="text-sm text-gray-400">إجمالي المواد: {subjects.length}</span>
            <Button variant={"outline"} onClick={() => {
                route.push("/session/subjects/new")
            }}>
                <Plus />
            </Button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-400">لا توجد مواد مضافة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.ID}
              onClick={() => {
                route.push(`/session/subjects/${subject.ID}`)
              }}
              className="group p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {subject.Title.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">
                      {subject.Title}
                    </h3>
                    <p className="text-xs text-gray-500">عرض التفاصيل</p>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-white transition-all transform group-hover:-translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Subjects