import React from 'react';

export default function BreadcrumbList({breadcrumbs, selectFolder}) {
  return (
    <ul id="breadcrumb-list">{
      breadcrumbs.map((folder, i) => {
        const folderPath = folder.path.replace(/\\/g, '\\\\');
        return (
          <li
            key={i}
            className="breadcrumb-list-item"
            onClick={() => selectFolder(folderPath, true)}
          >
            <h1 className="breadcrumb-name">{folder.name}</h1>
          </li>
        );
      })
    }</ul>
  );
}
