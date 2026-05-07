import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table"
import {useEffect, useState} from "react";
import {SysUser} from "@/types/record";
import {Button} from "@/components/ui/button";

const NO_RECORD_MESSAGE = "記録が存在しません";
type LookupDialogProps = {
    open: boolean;
    onClose: () => void;
    onSelect: (item: SysUser[]) => void;
    multiple?: boolean;
};

export function LookupDialog({ open, onClose, onSelect, multiple=true }: LookupDialogProps) {
    const [list, setList] = useState<SysUser[]>([]);
    const [selected, setSelected] = useState<SysUser[]>([]);

    const toggleSelect = (item: SysUser) => {
        setSelected(prev => {
            const exists = prev.find(i => i.sys_id === item.sys_id);

            if (exists) {
                return prev.filter(i => i.sys_id !== item.sys_id); // 取消选中
            } else {
                return [...prev, item]; // 添加
            }
        });
    };

    useEffect(() => {
        if (!open) return;

        fetch("/api/sansho_kengen_list")
            .then(res => res.json())
            .then(data => setList(data.data));
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>参照選択</DialogTitle>
                </DialogHeader>
                <Table>
                    <TableBody>
                        {list.length ? (
                            list.map((item) => (
                                <TableRow
                                    key={item.sys_id}
                                    className={selected.some(i => i.sys_id === item.sys_id) ? "bg-blue-100" : ""}
                                    onClick={() => toggleSelect(item)}
                                >
                                    <TableCell>{item.user_id}</TableCell>
                                    <TableCell>{item.first_name} {item.last_name}</TableCell>
                                    <TableCell>{item.company}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7}
                                           className="h-32 text-center text-muted-foreground italic">
                                    {NO_RECORD_MESSAGE}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Button
                    onClick={() => {
                        onSelect(selected);
                        onClose();
                    }}
                >
                    確定
                </Button>
            </DialogContent>
        </Dialog>
    );
}