import {prisma} from "@/lib/prisma";
import {SubprojectJohoIchiran, SubprojectJohoIchiranForm} from "@/types/record";
import {generateSysId, timeFormat} from "@/app/service/generate-util";
import {subprojectSchema} from "@/lib/validator/subproject";

export async function getSubprojectList(sys_id_list: string[] | null) {

    const records = await prisma.subproject_joho_ichiran.findMany({
        where: {
            ...(sys_id_list?.length && {
                joi_project_ref: {
                    in: sys_id_list
                },
            }),
        },
        orderBy: {
            updated: "desc",
        },
    });

    const results: SubprojectJohoIchiran[] = records.map(item => ({
        sys_id: item.sys_id,
        created: timeFormat(item.created),
        updated: timeFormat(item.updated),
        created_by: item.created_by,
        updated_by: item.updated_by,
        active: item.active,
        subproject_id: item.subproject_id || "",
        joi_project_id: item.joi_project_id,
        joi_project_ref: item.joi_project_ref,
        start_date: timeFormat(item.start_date),
        end_date: timeFormat(item.end_date),
        subproject_name: item.subproject_name,
        short_description: item.short_description || "",
    }))

    return {
        success: true,
        data: {
            subprojects: results
        }
    };
}

export async function getSubproject(sys_id: string) {
    const subproject = await prisma.subproject_joho_ichiran.findFirst({
        where: {
            sys_id: sys_id,
        },
    });
    if (subproject) {
        //DTO用
        const subprojectForm = {
            active: subproject.active,
            subproject_id: subproject.subproject_id,
            joi_project_id: subproject.joi_project_id || "",
            start_date: timeFormat(subproject.start_date),
            end_date: timeFormat(subproject.end_date),
            subproject_name: subproject.subproject_name,
            short_description: subproject.short_description || "",
        };
        const parsed = subprojectSchema.safeParse(subprojectForm);
        if (!parsed.success) {
            return {
                success:false,
                error: "INVALID SUBPROJECT DATA",
            };
        }

        return {
            success:true,
            data: {
                subproject: parsed.data,
            },
        };

    } else {
        return {
            success: false,
            error: "紐づいたProjectが見つかりませんでした。"
        };
    }
}

export async function createSubproject(
    joi_ref: string,
    subprojectForm: SubprojectJohoIchiranForm,
    user_id: string
) {
    const joi_project = await prisma.project_joho_ichiran.findFirst({
        where: {
            sys_id: joi_ref,
            active: true
        },
        select: {
            sys_id: true,
            project_id: true
        }
    })
    if (!joi_project) {
        return {
            success: false,
            error: "紐づいたProjectが見つかりませんでした。"
        };
    }
    const result = await prisma.$transaction(async (tx) => {
        const newSubproject = await tx.subproject_joho_ichiran.create({
            data: {
                sys_id: generateSysId(),
                joi_project_id: joi_project.project_id || "",
                joi_project_ref: joi_ref,
                start_date: subprojectForm.start_date,
                end_date: subprojectForm.end_date,
                subproject_name: subprojectForm.subproject_name,
                short_description: subprojectForm.short_description,
                active: true,
                created_by: user_id,
                updated_by: user_id,
            },
        });

        const subproject_id = 'SUB' + String(newSubproject.number).padStart(9, '0');
        await tx.subproject_joho_ichiran.update({
            where: {
                sys_id: newSubproject.sys_id
            },
            data: {subproject_id},
        });

        return newSubproject.sys_id;
    });

    return {
        success:true,
        data: {
            message: "登録成功",
            sys_id: result,
        }
    }
}

export async function updateSubproject(
    joi_ref: string,
    sys_id: string,
    subprojectForm: SubprojectJohoIchiranForm,
    user_id: string
) {
    const subproject = await prisma.subproject_joho_ichiran.findFirst({
        where: {sys_id}
    });

    if (!subproject) {
        return {
            success: false,
            error: "Subprojectが見つかりませんでした。"
        };
    }

    await prisma.subproject_joho_ichiran.update({
        where: {
            sys_id: sys_id,
        },
        data: {
            start_date: subprojectForm.start_date,
            end_date: subprojectForm.end_date,
            subproject_name: subprojectForm.subproject_name,
            short_description: subprojectForm.short_description,
            updated_by: user_id,
        },
    });

    return  {
        success:true,
        data: {
            message: "更新成功",
            sys_id: sys_id
        }
    };
}

export async function deleteSubproject(
    sys_id: string,
    user_id: string
) {
    const subproject = await prisma.subproject_joho_ichiran.findFirst(({
        where: {
            sys_id: sys_id,
        }
    }));

    if (!subproject) {
        return {
            success: false,
            error: "Subprojectが見つかりませんでした。"
        };
    }

    await prisma.subproject_joho_ichiran.update({
        where: {
            sys_id: sys_id,
        },
        data: {
            active: false,
            updated_by: user_id,
        }
    });
    return {
        success: true,
        data: {
            message: "削除成功",
            sys_id: sys_id,
        }
    };
}