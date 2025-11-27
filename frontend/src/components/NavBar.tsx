
import {Dock, DockIcon} from "@/components/ui/dock.tsx";
import {Link} from "react-router-dom";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {Button} from "@/components/ui/button.tsx";
import {useSelector} from "react-redux";
import type {UserType} from "@/utils/slice/configSlice.ts";
import {CheckCircle, GraduationCap, HeartHandshake, LayoutDashboard, Sparkles, Star, Wrench, Zap} from "lucide-react";
import useLogOut from "@/utils/hooks/useLogout.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import type {User} from "@/utils/types.ts";


export default function Navbar() {

    const user=useSelector((store:{user:null|User})=>store.user);
    const userType=useSelector((store:{config:{userType:UserType}})=>store.config.userType)
    const handleLogOut=useLogOut()

    return (

        <div className="md:hidden pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-12 flex origin-bottom h-full max-h-14">
            <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
            <Dock
                iconSize={50}
                className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] rounded-full ">

                <DockIcon size={60}>
                    <Link to={'/main'}>
                        <LayoutDashboard className=" h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                    </Link>


                </DockIcon>
                <DockIcon size={60}>
                    <Link to={'/main/tools'}>
                        <Wrench className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                    </Link>

                </DockIcon>
                <DockIcon size={60}>
                    <Popover>
                        <PopoverTrigger>
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_1460_3658"  maskUnits="userSpaceOnUse" x="0" y="0" width="27" height="27">
                                    <rect width="27" height="27" fill="#E4E4E6"/>
                                </mask>
                                <g mask="url(#mask0_1460_3658)">
                                    <path d="M12.5156 14.4702H5.90625V12.5015H12.5156V5.89209H14.4844V12.5015H21.0938V14.4702H14.4844V21.0796H12.5156V14.4702Z" fill="#E4E4E6"/>
                                </g>
                            </svg>
                        </PopoverTrigger>
                        <PopoverContent className={'bg-transparent border-0 flex items-center justify-center gap-4'}>
                            <Link to={'/main/book'}>
                                <Button variant={'secondary'} className={'rounded-full h-12 w-12 mt-4'}>
                                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.6667 28V21.3333H4V10.6667H10.6667V4H21.3333V10.6667H28V21.3333H21.3333V28H10.6667ZM13.3333 25.3333H18.6667V18.6667H25.3333V13.3333H18.6667V6.66667H13.3333V13.3333H6.66667V18.6667H13.3333V25.3333Z" fill="currentColor"/>
                                    </svg>
                                </Button>
                            </Link>

                            <Link to={'/main/checkin'}>
                                <Button variant={'secondary'} className={'rounded-full h-12 w-12 mb-4'}>
                                    <CheckCircle className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                                </Button>
                            </Link>
                            <Link to={'/main/ai'}>
                                <Button variant={'secondary'} className={'rounded-full h-12 w-12 mt-4'}>
                                    <Sparkles className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />

                                </Button>
                            </Link>

                        </PopoverContent>
                    </Popover>


                </DockIcon>

                {userType==='student'?(
                    <DockIcon size={60}>
                        <Link to={'/main/forum'}>
                            <GraduationCap className=" h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                        </Link>
                    </DockIcon>):(

                    <DockIcon size={60}>
                        <Popover>
                            <PopoverTrigger>
                                <GraduationCap className=" h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                            </PopoverTrigger>
                            <PopoverContent className={'bg-transparent border-0 flex items-center justify-center gap-4 pl-8'}>

                                <Link to={'/main/forum'}>
                                    <Button variant={'secondary'} className={'rounded-full h-12 w-12 '}>
                                        <Star className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
                                    </Button>
                                </Link>
                                <Link to={'/main/analytics'}>
                                    <Button variant={'secondary'} className={'rounded-full h-12 w-12 '}>
                                        <Zap className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />

                                    </Button>
                                </Link>
                            </PopoverContent>
                        </Popover>


                </DockIcon>
                )}

                <DockIcon size={60}>
                    <Popover>
                        <PopoverTrigger>
                            <Avatar className={"hover:cursor-pointer border"}>
                                <AvatarImage src={user?.photoUrl} alt="@shadcn" />
                                <AvatarFallback>{user?.firstName}</AvatarFallback>
                            </Avatar>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[150px] p-3 mb-4 md:hidden"
                            side="top"
                            align="end"
                            sideOffset={10}
                        >
                            <div className="grid gap-2">
                                <Link to={'/'}>
                                    <Button variant={'ghost'} className="w-full justify-start gap-2">
                                        <HeartHandshake className="h-5 w-5"/>
                                        <span>Sahayak</span>
                                    </Button>
                                </Link>
                                <Link to={'/main/profile'}>
                                    <Button variant={'ghost'} className="w-full justify-start gap-2">
                                        <svg width="20" height="20" viewBox="0 0 35 35" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M17.5 17.5a5.833 5.833 0 1 0 0-11.667A5.833 5.833 0 0 0 17.5 17.5zm0 5.833c-7.875 0-14.583 3.354-14.583 8.75h29.166c0-5.396-6.708-8.75-14.583-8.75z"
                                                fill="currentColor"/>
                                        </svg>
                                        <span>Profile</span>
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleLogOut}
                                    variant={'destructive'}
                                    className="w-full justify-start gap-2"
                                >
                                    <svg width="20" height="20" viewBox="0 0 35 35" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M24.792 10.208l-1.459 1.459 2.916 2.916H13.125v2.084h13.124l-2.916 2.916 1.459 1.459 5.208-5.209-5.208-5.208zM8.75 8.75h8.333V6.667H8.75c-1.146 0-2.083.937-2.083 2.083v17.5c0 1.146.937 2.083 2.083 2.083h8.333V26.25H8.75V8.75z"
                                            fill="currentColor"/>
                                    </svg>
                                    <span>Log out</span>
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </DockIcon>

            </Dock>
        </div>
    );
}
