import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-zinc-200">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 tracking-tight">ข้อตกลงและเงื่อนไขการให้บริการ (Terms of Service)</h1>
        
        <div className="space-y-6 text-zinc-600 leading-relaxed">
          <p className="text-sm text-zinc-400">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
          
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">1. การยอมรับเงื่อนไข</h2>
            <p>การที่คุณเข้าถึงและใช้งานแพลตฟอร์ม Lumina ถือว่าคุณได้อ่าน ทำความเข้าใจ และยอมรับข้อตกลงและเงื่อนไขเหล่านี้อย่างครบถ้วน หากคุณไม่เห็นด้วยกับเงื่อนไขใดๆ กรุณายกเลิกการใช้งานแพลตฟอร์มนี้</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">2. ขอบเขตการให้บริการ</h2>
            <p>Lumina เป็นแพลตฟอร์มซอฟต์แวร์ (SaaS) สำหรับบริหารจัดการร้านซาลอนและคลินิกความงาม เราให้บริการระบบจัดการคิว, การบันทึกธุรกรรม, และการดูรายงานสรุปผล เราขอสงวนสิทธิ์ในการปรับปรุง เปลี่ยนแปลง หรือยกเลิกฟีเจอร์ใดๆ ตามความเหมาะสมโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">3. หน้าที่และความรับผิดชอบของผู้ใช้</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>คุณต้องให้ข้อมูลที่เป็นความจริงในการสมัครสมาชิกและอัปเดตข้อมูลให้เป็นปัจจุบัน</li>
              <li>คุณเป็นผู้รับผิดชอบแต่เพียงผู้เดียวในการรักษาความลับของรหัสผ่านบัญชีของคุณ</li>
              <li>ห้ามมิให้ใช้แพลตฟอร์มนี้เพื่อกิจกรรมที่ผิดกฎหมาย ละเมิดสิทธิ์ผู้อื่น หรือส่งมัลแวร์เข้าสู่ระบบ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">4. ข้อจำกัดความรับผิดชอบ</h2>
            <p>ระบบจัดทำขึ้น "ตามสภาพที่เป็นอยู่" (As is) ทางเราพยายามอย่างดีที่สุดในการรักษาความเสถียรของระบบ แต่ไม่สามารถรับประกันได้ว่าระบบจะปราศจากข้อผิดพลาด หรือใช้งานได้ 100% ตลอดเวลา ทางเราจะไม่รับผิดชอบต่อความสูญเสียทางรายได้ หรือข้อมูลที่เกิดจากเหตุสุดวิสัยหรือเซิร์ฟเวอร์ขัดข้อง</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">5. การระงับและการยกเลิกบัญชี</h2>
            <p>เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้งานที่ละเมิดข้อตกลงและเงื่อนไขนี้ทันที โดยไม่ต้องแจ้งให้ทราบล่วงหน้า และไม่ต้องรับผิดชอบค่าเสียหายใดๆ ที่เกิดขึ้นจากการระงับบัญชีดังกล่าว</p>
          </section>
        </div>
      </div>
    </div>
  )
}
