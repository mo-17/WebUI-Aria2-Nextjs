'use client';

import { useState } from 'react';
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatBytes } from '@/lib/utils/format';
import type { DownloadFile } from '@/types/aria2';

interface FileNode extends DownloadFile {
  isDir?: boolean;
  children?: FileNode[];
}

interface FileSelectorProps {
  files: DownloadFile[];
  onChange: (selectedFiles: string[]) => void;
}

export function FileSelector({ files, onChange }: FileSelectorProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [fileList, setFileList] = useState<FileNode[]>(files as FileNode[]);

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const toggleFile = (file: FileNode) => {
    const updateFileSelection = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === file.path) {
          const newNode = { ...node, selected: !node.selected };
          if (node.children) {
            newNode.children = node.children.map(child => ({
              ...child,
              selected: newNode.selected
            }));
          }
          return newNode;
        }
        if (node.children) {
          return {
            ...node,
            children: updateFileSelection(node.children),
          };
        }
        return node;
      });
    };

    const updatedFiles = updateFileSelection(fileList);
    setFileList(updatedFiles);
    const selectedPaths = getAllSelectedPaths(updatedFiles);
    onChange(selectedPaths);
  };

  const getAllSelectedPaths = (nodes: FileNode[]): string[] => {
    const paths: string[] = [];
    nodes.forEach((node) => {
      if (node.selected) {
        paths.push(node.path);
      }
      if (node.children) {
        paths.push(...getAllSelectedPaths(node.children));
      }
    });
    return paths;
  };

  const renderFile = (file: FileNode, depth = 0) => {
    const isExpanded = expandedDirs.has(file.path);

    return (
      <div key={file.path}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors',
            file.selected && 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          )}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={() => (file.isDir ? toggleDir(file.path) : toggleFile(file))}
        >
          {file.isDir ? (
            <>
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
              )}
              <FolderIcon className={cn(
                "w-4 h-4 flex-shrink-0",
                file.selected ? "text-blue-500" : "text-gray-400"
              )} />
            </>
          ) : (
            <>
              <div className="w-4" />
              <FileIcon className={cn(
                "w-4 h-4 flex-shrink-0",
                file.selected ? "text-blue-500" : "text-gray-400"
              )} />
            </>
          )}
          <span className="flex-1 truncate">{file.path.split('/').pop()}</span>
          <span className="text-sm text-gray-500 flex-shrink-0">{formatBytes(file.length)}</span>
        </div>
        {file.isDir && isExpanded && file.children && (
          <div className="mt-1">
            {file.children.map((child) => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {fileList.map((file) => renderFile(file))}
    </div>
  );
} 