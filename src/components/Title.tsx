export const Title = ({ title, children }: { title: string, children?: React.ReactNode }) => {
    return (
        <div className="w-full pb-4 flex items-center text-slate-200 mb-6 uppercase border-b border-slate-700">
            <span className="w-3 h-3 bg-cyan-600 rounded-full inline-block mr-3" />
            <h1 className="tracking-widest text-lg md:text-xl font-semibold">
                {title}
            </h1>
            {children}
        </div>
    );
};