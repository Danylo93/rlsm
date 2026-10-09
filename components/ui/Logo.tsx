import Image from 'next/image'

export default function Logo({ className = '' }: { className?: string }) {
    return (
        <Image
            src="/rl-logo-.png"
            alt="Radicais Livres São Miguel"
            width={1280}
            height={1280}
            // logo no header, acima da dobra: é o LCP da página
            loading="eager"
            className={`h-14 w-14 object-contain sm:h-16 sm:w-16 ${className}`}
        />
    )
}
