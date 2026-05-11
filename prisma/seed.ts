import {prisma} from "../lib/prisma"
import {generatePasswordHashing, generateSysId} from "@/lib/format_utils";

const ROLE_ADMIN = "admin"
async function main() {
    const exist = await prisma.sys_user.count()

    if (exist > 0) {
        console.log('Seed skipped: users already exist')
        return
    }

    const password = await generatePasswordHashing(process.env.SEED_ADMIN_PASSWORD || 'admin0001')
    await prisma.$transaction(async (tx) => {
        const existCheck = await tx.sys_user.count();
        if (existCheck > 0) {
            throw new Error("ADMIN_ALREADY_EXISTS");
        }
        await tx.sys_account.create({
            data: {
                sys_id: generateSysId(),
                user_id: "Administrator",
                password_hash: password,
                created_by: 'system',
                updated_by: 'system',
                active: true,
            },
        });

        await tx.sys_user.create({
            data: {
                sys_id: generateSysId(),
                user_id: "Administrator",
                first_name: "起動",
                last_name: "管理者",
                company: "全社",
                email: process.env.SEED_ADMIN_EMAIL || "admin@jandoe.com",
                created_by: 'system',
                updated_by: 'system',
            }
        });

        await tx.sys_user_role.create({
            data: {
                sys_id: generateSysId(),
                role: ROLE_ADMIN,
                user_id: "Administrator",
                start_date: new Date(),
                end_date: new Date("2099-12-31"),
                created_by: "system",
                updated_by: "system",
            }
        });
    });
    console.log('Seeding admin...')
    console.log('✅ Admin created')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })