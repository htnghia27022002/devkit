export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-blue-500 text-white">
                <img src="/icon.jpg" alt="App Logo" className="h-8 w-8 rounded-md object-cover" />
            
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    DevKit
                </span>
            </div>
        </>
    );
}
