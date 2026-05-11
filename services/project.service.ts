import {prisma} from "@/lib/prisma";
import {generateSysId, timeFormat} from "@/lib/format_utils";
import {getUserName, getUserSysId} from "@/lib/user_utils";
import {FormKengenList, ProjectJohoIchiran, ProjectJohoIchiranForm, SubprojectJohoIchiran} from "@/types/record";
import {projectSchema} from "@/lib/validator/project";

export async function getProjectList(sys_id_list: string[] | null) {
    //対象プロジェクト取得
    const projects = await prisma.project_joho_ichiran.findMany({
        where: {
            ...(sys_id_list?.length && {
                sys_id: { in: sys_id_list }
            })
        },
        orderBy: {
            updated: "desc",
        },
    });
    //DTO変換（フロント用）
    const results: ProjectJohoIchiran[] = projects.map(item => ({
        sys_id: item.sys_id,
        created: timeFormat(item.created),
        updated: timeFormat(item.updated),
        created_by: item.created_by,
        updated_by: item.updated_by,
        active: item.active,
        project_id: item.project_id || "",
        start_date: timeFormat(item.start_date),
        end_date: timeFormat(item.end_date),
        department: item.department,
        project_type: item.project_type,
        project_name: item.project_name,
        short_description: item.short_description || "",
    }));

    return {
        success: true,
        data: {projects: results},
    }
}

export async function getProjects(sys_id: string) {
    const project = await prisma.project_joho_ichiran.findUnique({
        where: {
            sys_id: sys_id,
        }
    });

    if (project) {
        //紐づいたSubproject取得
        const subprojects = await prisma.subproject_joho_ichiran.findMany({
            where: {
                joi_project_ref: sys_id,
                active: true
            }
        })
        const result_subprojects: SubprojectJohoIchiran[] = subprojects.map(subproject => ({
            sys_id: subproject.sys_id,
            created: timeFormat(subproject.created),
            updated: timeFormat(subproject.updated),
            created_by: subproject.created_by,
            updated_by: subproject.updated_by,
            active: subproject.active,
            subproject_id: subproject.subproject_id,
            joi_project_id: subproject.joi_project_id,
            joi_project_ref: subproject.joi_project_ref,
            start_date: timeFormat(subproject.start_date),
            end_date: timeFormat(subproject.end_date),
            subproject_name: subproject.subproject_name,
            short_description: subproject.short_description
        }))

        //紐づいた参照可能ユーザーすべて取得
        const kengen = await prisma.sannsho_kengen_list.findMany({
            where: {
                reference_ticket: sys_id,
                active: true
            },
            select: {
                sys_id: true,
                user_id: true,
            }
        })
        const userIds = kengen.map(k => k.user_id);

        const users = await prisma.sys_user.findMany({
            where: {
                user_id: {
                    in: userIds
                }
            },
            select: {
                first_name: true,
                last_name: true,
                user_id: true,
            }
        });

        const userMap = new Map(
            users.map(u => [
                u.user_id,
                `${u.last_name} ${u.first_name}`
            ])
        );

        const sansho_kengen_list = kengen.map(item => ({
            sys_id: item.sys_id,
            name: userMap.get(item.user_id) || "Unknown",
            user_id: item.user_id,
        }));

        //ページInputリセット用
        const resultCombine = {
            active: project.active,
            project_id: project.project_id || "",
            start_date: timeFormat(project.start_date),
            end_date: timeFormat(project.end_date),
            department: project.department,
            project_type: project.project_type,
            project_name: project.project_name,
            short_description: project.short_description || "",
            sansho_user: sansho_kengen_list
        };

        const parsed = projectSchema.safeParse(resultCombine);
        if (!parsed.success) {
            return {
                success: false,
                error: "INVALID PROJECT DATA",
            };
        }

        return {
            success: true,
            data: {
                project: parsed.data,
                subprojects: result_subprojects,
            },
        };
    } else {
        return {
            success: false,
            error: "Projectが見つかりませんでした",
        };
    }

}

//新規Project作成する用
export async function createProject(
    projectData: ProjectJohoIchiranForm,
    user_id: string
) {
    const result = await prisma.$transaction(async (tx) => {
        //新規Projectレコード作成
        const newProject = await tx.project_joho_ichiran.create({
            data: {
                sys_id: generateSysId(),
                start_date: projectData.start_date,
                end_date: projectData.end_date,
                department: projectData.department,
                project_type: projectData.project_type,
                project_name: projectData.project_name,
                short_description: projectData.short_description,
                active: true,
                created_by: user_id,
                updated_by: user_id,
            },
        });

        //ProjectIDを生成
        const project_id =
            "PRO" + String(newProject.number).padStart(9, "0");

        const numberedProject = await tx.project_joho_ichiran.update({
            where: {sys_id: newProject.sys_id},
            data: {project_id},
        });

        //参照ユーザーレコード作成
        if (projectData.sansho_user?.length) {
            await tx.sannsho_kengen_list.createMany({
                data: projectData.sansho_user.map((u: FormKengenList) => ({
                    sys_id: generateSysId(),
                    reference_table: "project_joho_ichiran",
                    reference_ticket: newProject.sys_id,
                    reference_ticket_id: numberedProject.project_id || "",
                    user_sys_id: u.sys_id,
                    user_id: u.user_id,
                    user_name: u.name,
                    created_by: user_id,
                    updated_by: user_id,
                })),
            });
        }

        // 作成者を参照権限ユーザーに追加
        const [creatorName, creatorSysId] = await Promise.all([
            getUserName(user_id),
            getUserSysId(user_id),
        ]);

        await tx.sannsho_kengen_list.create({
            data: {
                sys_id: generateSysId(),
                reference_table: "project_joho_ichiran",
                reference_ticket: newProject.sys_id,
                reference_ticket_id: numberedProject.project_id || "",
                user_sys_id: creatorSysId,
                user_id,
                user_name: creatorName,
                created_by: user_id,
                updated_by: user_id,
            },
        });
        return newProject.sys_id;
    });

    return result;
}

export async function createProjectsFromCSV(
    projects: ProjectJohoIchiranForm[],
    user_id: string
) {
    let successCount = 0;
    const errors: { index: number; error: unknown }[] = [];

    for (let i = 0; i < projects.length; i++) {
        try {
            await createProject(projects[i], user_id);
            successCount++;
        } catch (error) {
            errors.push({
                index: i,
                error,
            });
        }
    }

    return {
        successCount,
        errorCount: errors.length,
        errors,
    };
}

export async function updateProject(
    sys_id: string,
    projectData: ProjectJohoIchiranForm,
    user_id: string
) {
    await prisma.$transaction(async (tx) => {
        const existingProject = await tx.project_joho_ichiran.findUnique({
            where: {sys_id},
        });

        if (!existingProject) {
            throw new Error("NOT_FOUND");
        }

        await tx.project_joho_ichiran.update({
            where: {sys_id},
            data: {
                start_date: projectData.start_date,
                end_date: projectData.end_date,
                department: projectData.department,
                project_type: projectData.project_type,
                project_name: projectData.project_name,
                short_description: projectData.short_description,
                updated_by: user_id,
            },
        });

        const existing = await tx.sannsho_kengen_list.findMany({
            where: {
                reference_table: "project_joho_ichiran",
                reference_ticket: sys_id,
            },
        });

        const existingUsers = new Set(existing.map((r) => r.user_id));
        const newUsers = new Set(
            projectData.sansho_user?.map((u: FormKengenList) => u.user_id) || []
        );

        const toAdd = [...newUsers].filter((u) => !existingUsers.has(u));
        const toDisable = existing
            .filter((r) => !newUsers.has(r.user_id))
            .map((r) => r.user_id);

        await tx.sannsho_kengen_list.updateMany({
            where: {
                reference_ticket: sys_id,
                user_id: {in: toDisable},
            },
            data: {active: false, updated_by: user_id},
        });

        const data = await Promise.all(
            toAdd.map(async (user) => ({
                sys_id: generateSysId(),
                reference_table: "project_joho_ichiran",
                reference_ticket: sys_id,
                reference_ticket_id: existingProject.project_id || "",
                user_sys_id: await getUserSysId(user),
                user_id: user,
                user_name: await getUserName(user),
                created_by: user_id,
                updated_by: user_id,
            }))
        );

        await tx.sannsho_kengen_list.createMany({data});
    });
}

export async function deleteProject(
    sys_id: string,
    user_id: string
) {
    await prisma.$transaction(async (tx) => {
        await tx.project_joho_ichiran.update({
            where: {sys_id},
            data: {active: false, updated_by: user_id},
        });

        await tx.subproject_joho_ichiran.updateMany({
            where: {joi_project_ref: sys_id, active: true},
            data: {active: false, updated_by: user_id},
        });

        await tx.sannsho_kengen_list.updateMany({
            where: {
                reference_table: "project_joho_ichiran",
                reference_ticket: sys_id,
            },
            data: {active: false, updated_by: user_id},
        });
    });
}

