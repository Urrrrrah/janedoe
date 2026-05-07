import {
    LoginLogs,
    ProjectJohoIchiran,
    ProjectJohoIchiranForm,
    SubprojectJohoIchiran,
    SubprojectJohoIchiranForm,
    SysUser, SysUserForm
} from "@/types/record";

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export type ImportResponse = {
    count: number;
};

export type LoginLogsResponse = {
    logs: LoginLogs[];
}

export type SysUserIchiranResponse = {
    sysusers: SysUser[];
}

export type SysUserResponse = {
    sysuser: SysUserForm;
}

export type ProjectJohoIchiranResponse = {
    projects: ProjectJohoIchiran[];
}

export type SubprojectShosaiResponse = {
    subproject: SubprojectJohoIchiranForm;
}

export type SubprojectJohoIchiranResponse = {
    subprojects: SubprojectJohoIchiran[];
}

export type SysUserFormResponse = {
    sysuser: SysUserForm;
}

export type NewSubprojectResponse = {
    joi_project_id: string;
    joi_project_ref: string;
}

export type ProjectFormResponse = {
    project: ProjectJohoIchiranForm;
    subprojects: SubprojectJohoIchiran[];
}

export type UpdateResponse = {
    message: string;
    sys_id: string;
}

export type SessionUser = {
    id: string;
    user_id: string;
    roles: string[];
};