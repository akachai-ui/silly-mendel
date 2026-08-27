import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-zinc-200">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold text-zinc-900 mb-8 tracking-tight">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
        
        <div className="space-y-6 text-zinc-600 leading-relaxed">
          <p className="text-sm text-zinc-400">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
          
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">1. บทนำ</h2>
            <p>Lumina ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน ("คุณ") นโยบายฉบับนี้อธิบายถึงวิธีการที่เรารวบรวม ใช้งาน จัดเก็บ และเปิดเผยข้อมูลส่วนบุคคลของคุณ เพื่อให้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">2. ข้อมูลที่เรารวบรวม</h2>
            <p>เมื่อคุณใช้งานแพลตฟอร์มของเรา เราจะเก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>ข้อมูลบัญชี:</strong> ชื่อ อีเมล และรูปโปรไฟล์ (กรณีเข้าสู่ระบบด้วยบัญชี Google)</li>
              <li><strong>ข้อมูลธุรกิจ:</strong> ชื่อร้านซาลอน ข้อมูลพนักงาน และรายการบริการต่างๆ</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> ข้อมูลรายการธุรกรรม ประวัติการจองคิว และพฤติกรรมการใช้งานในระบบ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">3. การนำข้อมูลไปใช้</h2>
            <p>เราใช้ข้อมูลส่วนบุคคลของคุณเพื่อวัตถุประสงค์ต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>เพื่อสร้างบัญชีและให้บริการฟีเจอร์ต่างๆ บนแพลตฟอร์ม</li>
              <li>เพื่อวิเคราะห์และปรับปรุงประสิทธิภาพการทำงานของระบบให้ดีขึ้น</li>
              <li>เพื่อติดต่อสื่อสาร แจ้งเตือนการอัปเดต หรือให้ความช่วยเหลือด้านการใช้งาน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">4. การรักษาความปลอดภัยของข้อมูล</h2>
            <p>ข้อมูลของคุณจะถูกจัดเก็บไว้ในเซิร์ฟเวอร์ที่มีมาตรฐานความปลอดภัยระดับสากล เราใช้มาตรการทางเทคนิคที่เหมาะสมเพื่อป้องกันการสูญหาย การเข้าถึง หรือการเปิดเผยข้อมูลโดยไม่ได้รับอนุญาต อย่างไรก็ตาม ไม่มีระบบใดในอินเทอร์เน็ตที่ปลอดภัย 100%</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-3">5. สิทธิของเจ้าของข้อมูล</h2>
            <p>คุณมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของคุณออกจากระบบของเรา รวมถึงสิทธิในการเพิกถอนความยินยอมในการประมวลผลข้อมูล หากคุณต้องการใช้สิทธิเหล่านี้ สามารถดำเนินการแจ้งขอใช้สิทธิผ่านทางทีมงานของเรา</p>
          </section>
        </div>
      </div>
    </div>
  )
}
