export enum EditorType { External, SameWindow }

export interface EditorWindowInfo {
    splitView?: boolean;
}

export interface OpenEditorMessage {
    editorType: EditorType;
    windowInfo?: EditorWindowInfo;
    url: string;
    buttonType?: string;
}

export interface ExitEditorMessage {
    isEditorLoaded: boolean;
}