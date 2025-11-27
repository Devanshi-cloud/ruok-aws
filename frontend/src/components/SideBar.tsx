import {useState} from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {Link, Outlet, useNavigate} from "react-router-dom";
import {LayoutDashboard,
    CheckCircle,
    Wrench,
    HeartHandshake,
    LogOut,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Plus,
    GraduationCap,
    Star,
    Zap} from "lucide-react";
import { useSelector ,useDispatch } from "react-redux";
import type { User } from "@/utils/types";
import type {UserType} from "@/utils/slice/configSlice.ts";
import useLogOut from "@/utils/hooks/useLogout.ts";
import {Card} from "@/components/ui/card.tsx";
import { InteractiveHoverButton } from "./magicui/interactive-hover-button";
import {removeUser} from "@/utils/slice/userSlice.ts";

import Navbar from "@/components/NavBar.tsx";

interface NestedLink {
    label: string;
    to: string;
    icon: React.ReactNode;
}

interface SidebarGroup {
    label: string;
    icon: React.ReactNode;
    children: NestedLink[];
}

export function SideBar() {
    const user = useSelector((store: {user: null | User}) => store.user);
    const userType = useSelector((store: {config: {userType: UserType}}) => store.config.userType);
    const handleLogOut = useLogOut();
    const isBlocked = useSelector((store: {config: {isBlocked: boolean}}) => store.config.isBlocked);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const handleGuestNavigate = () => {
        dispatch(removeUser());
        navigate("/login");
    };

    const toggleGroup = (groupLabel: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupLabel)
                ? prev.filter(g => g !== groupLabel)
                : [...prev, groupLabel]
        );
    };

    let basicLinks = [
        {
            label: "Dashboard",
            to: "/main",
            icon: (
                <LayoutDashboard className="ml-2 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            ),
        },
        {
            label: "Tools",
            to: "/main/tools",
            icon: (
                <Wrench className="ml-2 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            ),
        },

    ];
    if (userType === 'student'){
        basicLinks.push({label: "Forum",
            to: "/main/forum",
            icon: (
                <GraduationCap className="ml-2 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            ),})

    }



    const quickActionsGroup: SidebarGroup = {
        label: "Quick Actions",
        icon: <Plus className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />,
        children: [
            {
                label: "Health Check",
                to: "/main/book",
                icon: <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.6667 28V21.3333H4V10.6667H10.6667V4H21.3333V10.6667H28V21.3333H21.3333V28H10.6667ZM13.3333 25.3333H18.6667V18.6667H25.3333V13.3333H18.6667V6.66667H13.3333V13.3333H6.66667V18.6667H13.3333V25.3333Z" fill="currentColor"/>
                </svg>
            },
            {
                label: "Check-In",
                to: "/main/checkin",
                icon: <CheckCircle className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            },
            {
                label: "Sage AI",
                to: "/main/ai",
                icon: <Sparkles className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            }
        ]
    };


    const academicGroup: SidebarGroup | null = userType !== 'student' ? {
        label: "Academic",
        icon: <GraduationCap className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />,
        children: [
            {
                label: "Forum",
                to: "/main/forum",
                icon: <Star className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            },
            {
                label: "Analytics",
                to: "/main/therapist",
                icon: <Zap className="h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-200" />
            },

        ]
    } : null;

    const sidebarGroups = [quickActionsGroup, academicGroup].filter(Boolean) as SidebarGroup[];

    if(user === null){
        return (
            <div className={'flex flex-col items-center justify-center h-screen'}>
                <HeartHandshake className={'h-20 w-20 animate-bounce'}/>
            </div>
        );
    }

    return (
        <div
            className={cn(
                " mx-auto flex w-full  flex-1 flex-col overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 md:flex-row dark:border-zinc-900 dark:bg-black",
                "h-screen relative"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 border-2 font-secondary">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}

                        <div className="mt-8 flex flex-col gap-2">

                            {basicLinks.map((link, idx) => (
                                <Link key={idx} to={link?.to} className={'cursor-pointer'}>
                                    <SidebarLink link={link} />
                                </Link>
                            ))}

                            {/* Collapsible Groups */}
                            {sidebarGroups.map((group, groupIdx) => (
                                <div key={groupIdx} className="flex flex-col">
                                    <button
                                        onClick={() => toggleGroup(group.label)}
                                        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            {group.icon}
                                            {open && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1, ease: "easeInOut" }}
                                                    className="text-sm text-zinc-700 dark:text-zinc-200"
                                                >
                                                    {group.label}
                                                </motion.span>
                                            )}
                                        </div>
                                        {open && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1, ease: "easeInOut" }}
                                            >
                                                {expandedGroups.includes(group.label) ? (
                                                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                                                )}
                                            </motion.div>
                                        )}
                                    </button>

                                    {/* Nested Links */}
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{
                                            height: expandedGroups.includes(group.label) ? "auto" : 0,
                                            opacity: expandedGroups.includes(group.label) ? 1 : 0
                                        }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        {expandedGroups.includes(group.label) && (
                                            <div className="ml-6 mt-2 flex flex-col gap-1">
                                                {group.children.map((childLink, childIdx) => (
                                                    <Link key={childIdx} to={childLink.to} className={'cursor-pointer'}>
                                                        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                                                            {childLink.icon}
                                                            {open && (
                                                                <motion.span
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: 0.1, ease: "easeInOut" }}
                                                                    className="text-sm text-zinc-600 dark:text-zinc-300"
                                                                >
                                                                    {childLink.label}
                                                                </motion.span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}

                        </div>
                    </div>

                    <div>
                        <Link to={'/main/profile'}>
                            <SidebarLink
                                className={''}
                                link={{
                                    label: user?.firstName,
                                    href: "",
                                    icon: (
                                        <img
                                            src={user?.photoUrl}
                                            className="h-7 w-7 shrink-0 rounded-full"
                                            width={50}
                                            height={50}
                                            alt="Avatar"
                                        />
                                    ),
                                }}
                            />
                        </Link>
                        <button
                            onClick={handleLogOut}
                            className="flex items-center space-x-2 m-1 cursor-pointer">
                            <LogOut className="h-5 w-5"/>
                            {open && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1, ease: "easeInOut" }}
                                    className=" text-sm">
                                    Log Out
                                </motion.span>
                            )}
                        </button>
                    </div>
                </SidebarBody>
            </Sidebar>

            {isBlocked && (
                <div className="absolute z-20 bg-zinc-500/60 dark:bg-zinc-900/60 backdrop-blur-sm h-screen w-full flex flex-col items-center justify-center">
                    <Card className="w-[20rem] md:w-[37rem] h-[23rem] bg-zinc-100 dark:bg-zinc-950 overflow-hidden border-3 flex flex-col items-center justify-center">
                        <h1 className="font-mynabali text-5xl md:text-7xl my-4 font-medium">
                            Sahayak
                        </h1>
                        <p className="text-center px-12 font-secondary text-sm text-zinc-700 dark:text-zinc-400">
                            You've reached the end of your free guest session!<br/>
                            Create an account to continue exploring your emotions and unlock all of Sahayak's features.
                        </p>
                        <InteractiveHoverButton
                            onClick={handleGuestNavigate}
                            className="text-lg">
                            LogIn
                        </InteractiveHoverButton>
                    </Card>
                </div>
            )}

            <Navbar/>
            <Outlet/>
        </div>
    );
}

export const Logo = () => {
    return (
        <Link
            to={'/'}
            className="relative z-20 flex items-center space-x-3 py-1 "
        >
            <HeartHandshake className={'h-7 w-7'}/>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mynabali-serif  font-semibold font-2xl whitespace-pre text-black dark:text-white"
            >
                Sahayak
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to={'/'}
            className="relative z-20 flex items-center space-x-3 py-1 "
        >
            <HeartHandshake className={'h-7 w-7'}/>
        </Link>
    );
};