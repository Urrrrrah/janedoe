import {
    Users,
    History,
    LogOut,
    ArrowBigUp,
    BookOpen,
    BookOpenText, ArrowBigDown
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {TooltipProvider} from "@/components/ui/tooltip";
import Link from 'next/link'


const navItems = [
    {title: "Project情報", url: "/pms/list/project_ichiran?page=1", icon: BookOpen},
    {title: "Subproject情報", url: "/pms/list/subproject_ichiran", icon: BookOpenText},
    {title: "CSVインポート", url: "/pms/csv_import", icon: ArrowBigUp },
    {title: "ユーザー情報編集", url: "/pms/user_register?mode=update", icon: Users},
    {title: "管理者機能▼", url:"", icon: ArrowBigDown },
    {title: "アカウント登録", url: "/pms/user_register?mode=create", icon: Users},
    {title: "ユーザー情報一覧", url: "/pms/list/sys_user_ichiran", icon: Users},
    {title: "ログイン履歴", url: "/pms/list/login_logs", icon: History},
]

export function AppSidebar() {
    return (
        <TooltipProvider delayDuration={0}>
            <Sidebar variant="sidebar" collapsible="icon">

                {/*sidebarヘッダー*/}
                <SidebarHeader className="border-b px-4 py-4">
                    <div className="flex items-center gap-2 font-bold text-primary">
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">
                            P
                        </div>
                        <span className="truncate">PMS システム</span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>メインメニュー</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <Link href={item.url} className="flex items-center gap-3">
                                                <item.icon className="size-4"/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* 👤 bottom：ログアウトボタン */}
                <SidebarFooter className="border-t p-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className="text-destructive hover:bg-destructive/10">
                                <Link href="/api/auth/signout">
                                    <LogOut className="size-4"/>
                                    <span>ログアウト</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    )
}