'use client';

import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BiHome, BiSearch, BiPlusCircle, BiCalculator } from 'react-icons/bi';

type UserData = {
    user: {
        picture?: string;
        username?: string;
        email?: string;
    };
    token?: string;
};

type NavItem = {
    title: string;
    icon: React.ReactNode;
    href?: string;
    subItems?: {
        title: string;
        href: string;
    }[];
};

const navigation: NavItem[] = [
    {
        title: "HOME",
        href: "/",
        icon: <BiHome />,
    },
    {
        title: "検索",
        href: "/search",
        icon: <BiSearch />,
    },
    {
        title: "商品登録",
        href: "/product-register",
        icon: <BiPlusCircle />,
    },
    {
        title: "送料計算",
        href: "/shipping-calculator",
        icon: <BiCalculator />,
    },
    {
        title: "リクエスト一覧",
        href: "/request-list",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
        ),
    },
    {
        title: "出品データ管理",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
        ),
    },
    {
        title: "各種設定",
        href: "/settings",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

export function Sidebar() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData>({ user: {} });
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = () => {
            const authToken = Cookies.get('auth');
            if (authToken) {
                setUserData({ user: {}, token: authToken });
            }
        };

        loadUserData();
    }, []);

    const handleLogout = () => {
        Cookies.remove('auth');
        setUserData({ user: {} });
        router.push('/login');
    };

    return (
        <div className="flex h-full w-64 flex-col bg-[#1e2a3b]">
            <div className="flex flex-col px-6 py-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Market King</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => (
                    <div
                        key={item.title}
                        onClick={() => {
                            if (item.href) {
                                router.push(item.href);
                            }
                        }}
                        className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-gray-300 hover:bg-[#2a3a51]/50 hover:text-white"
                    >
                        <span className="mr-3 text-gray-400 group-hover:text-white">
                            {item.icon}
                        </span>
                        {item.title}
                    </div>
                ))}
            </nav>

            <div className="border-t border-navy-800 p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full focus:outline-none">
                        <div className="flex items-center justify-between space-x-3 px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 ring-2 ring-navy-700">
                                    <AvatarImage src={userData.user.picture} />
                                    <AvatarFallback className="bg-navy-700 text-white">{userData.user.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left truncate">
                                    <p className="text-sm font-medium text-white truncate">{userData.user.username}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={10}>
                        <DropdownMenuLabel>アカウント設定</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                            ログアウト
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
} 