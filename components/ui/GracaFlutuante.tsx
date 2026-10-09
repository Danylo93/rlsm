import Image from 'next/image'

/** Mascote decorativo da RLCON, animado por CSS sem interceptar cliques. */
export default function GracaFlutuante() {
    return (
        <div className="graca-flutuante" aria-hidden="true">
            <Image
                src="/img/decoracao/graca.webp"
                alt=""
                width={1080}
                height={1350}
                sizes="(max-width: 767px) 76px, 104px"
                className="graca-mascote"
                draggable={false}
            />
        </div>
    )
}
