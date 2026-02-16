import { CutOutBtn, CutOutBtnPrimary } from "@/components/CutOutBtn";

export const GamesPage = () => {
    return (
        <>
            <div className="min-h-full flex flex-col relative">
                <div className="
                                sticky top-0 z-10
                                flex flex-col lg:flex-row   
                                w-full gap-4 p-4
                                bg-slate-950
                                border-b border-slate-700
                            ">
                    <div className="flex-1 md:flex-none lg:w-md">
                        <CutOutBtnPrimary
                            icon="material-symbols:dashboard-customize"
                            text="create match"
                            // onClick={() => createMatchModalRef.current?.open()}
                        />
                    </div>
                    <div className="flex gap-4 w-full lg:max-w-sm">
                        <CutOutBtn
                            icon="lsicon:warehouse-into-filled"
                            text="join lobby"
                            // onClick={() => joinLobbyModalRef.current?.open()}
                        />
                    </div>
                </div>
                {/* <div className="flex flex-1 w-11/12 space-y-10 mx-auto py-6 md:py-10">
                    {isLoading ? (
                        <div className="flex justify-center items-center w-full">
                            <LoadingSpinner
                                message="Loading match..."
                            />
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center w-full">
                            <ErrorMessage
                                title="Error loading match"
                                message={error.message}
                            />
                        </div>
                    ) : !match ? (
                        <div className="flex justify-center items-center w-full">
                            <WarningMessage
                                title="No match found"
                                message="No active match found. Create a new match or join an existing lobby."
                            />
                        </div>
                    ) : (
                        <MatchContent match={match} />
                    )}
                </div> */}
            </div>
        </>
    );
};