import { redirect } from 'next/navigation';

export default function Home() {
  // มาตรฐาน SaaS ที่ดี หากยังไม่มีหน้า Sale Page (หน้าขายของ) 
  // ควรเด้งไปที่หน้า Login ทันทีเพื่อลดขั้นตอนการคลิกของ User ครับ
  redirect('/login');
}
