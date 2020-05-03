import React from 'react';

export default function FolderList({folders, selectFolder}) {
  return (
    <ul id="folder-list">
      {folders.map((folder, i) => (
        <li
          key={i}
          className="folder-list-item"
          onClick={() => selectFolder(folder)}
        >
          <h1 className="folder-name">{folder}</h1>
        </li>
      ))}
    </ul>
  );
}
