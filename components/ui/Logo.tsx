/**
 * Logotipo tipográfico RL / SÃO MIGUEL.
 * Se existir o logotipo oficial, troque este componente por um <img>/<svg>.
 */

export default function Logo({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex items-center gap-2.5 leading-none ${className}`}>
            <span className="display grid h-9 w-9 place-items-center bg-acido pt-[2px] text-[22px] text-preto sm:h-10 sm:w-10 sm:text-[25px]">
                RL
            </span>
            <span className="wide flex flex-col gap-[3px] text-[9px] tracking-[0.18em] sm:text-[10px]">
                <span>São</span>
                <span>Miguel</span>
            </span>
        </span>
    )
}
