import Image from 'next/image'
import { AuthForm } from '@/components/auth-form'

export default function AccountPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2 bg-background overflow-hidden">
      {/* Image panel */}
      <div className="relative hidden lg:block bg-background overflow-hidden">
        <Image
          src="/images/auth-keys.png"
          alt="Close-up of glossy black grand piano keys and the golden harp frame"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Seamless left-to-right dark gradient overlay fixing any edge glare or white line */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-background" />
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />

        <div className="absolute bottom-0 left-0 p-14 z-10">
          <p className="max-w-sm font-serif text-2xl leading-snug text-foreground/90 text-balance">
            “The instrument chooses the room.”
          </p>
          <p className="mt-4 text-[0.65rem] uppercase tracking-[0.3em] text-gold font-medium">
            Members of the Atelier
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-5 py-16 md:px-10">
        <AuthForm initialMode="register" />
      </div>
    </main>
  )
}
