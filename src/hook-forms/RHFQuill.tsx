import React, { useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import { Controller, useController } from 'react-hook-form';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const RHFQuill = ({ control, name, ...rest }) => {
  if (!control) {
    console.error('Control prop is missing. Please provide a valid control object from useForm.');
    return null;
  }
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: '',
  });
  // Inject inline styles for dark mode
//   useEffect(() => {
//     if (isDarkMode) {
//       const style = document.createElement('style');
//       style.innerHTML = `
//         .ql-toolbar.ql-snow {
//           background-color: #2b2c40 !important;
//           color: #ffffff !important;
//           border: 1px solid #444 !important;
//         }
//         .ql-toolbar.ql-snow .ql-picker,
//         .ql-toolbar.ql-snow .ql-picker-label,
//         .ql-toolbar.ql-snow .ql-picker-item {
//           color: #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-stroke {
//           stroke: #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-fill {
//           fill: #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-picker-options {
//           background-color: #2b2c40 !important;
//           color: #ffffff !important;
//         }
//       `;
//       document.head.appendChild(style);
//       return () => document.head.removeChild(style);
//     }
//   }, [isDarkMode]);

useEffect(() => {
  if (isDarkMode) {
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-toolbar.ql-snow {
        background-color: #2b2c40 !important;
        color: #ffffff !important;
        border: 1px solid #444 !important;
      }
      .ql-toolbar.ql-snow .ql-picker,
      .ql-toolbar.ql-snow .ql-picker-label,
      .ql-toolbar.ql-snow .ql-picker-item {
        color: #ffffff !important;
      }
      .ql-toolbar.ql-snow .ql-stroke {
        stroke: #ffffff !important;
      }
      .ql-toolbar.ql-snow .ql-fill {
        fill: #ffffff !important;
      }
      .ql-toolbar.ql-snow .ql-picker-options {
        background-color: #2b2c40 !important;
        color: #ffffff !important;
      }
      .ql-editor.ql-blank::before {
        color: rgba(255, 255, 255, 0.6) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }
}, [isDarkMode]);


  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }], // custom sizes
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }], // custom colors
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'], // remove formatting
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align',
  ];

  return (
    <div>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={value}
              error={error}
              onChange={(val) => onChange(val)}
              onBlur={onBlur} // Trigger validation on blur
              placeholder="Start typing message..."
              modules={modules}
              formats={formats}
              {...rest}
              style={{ height: '100%', width: '100%' }}
            />
          )}
        />
      </div>
      {error && (
        <div
          style={{
            fontSize: '0.75rem',
                color: '#FF3E1D',
                marginRight: '14px',
                fontWeight: 400,
                marginTop: '3px',
          }}
        >
          {error.message}
        </div>
      )}
    </div>
  );
};

export default RHFQuill;

// import React, { useEffect } from 'react';
// import 'react-quill/dist/quill.snow.css';
// import dynamic from 'next/dynamic';
// import { useTheme } from '@mui/material/styles';
// import { Controller, useController } from 'react-hook-form';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// const RHFQuill = ({ control, name, ...rest }) => {
//   if (!control) {
//     console.error('Control prop is missing. Please provide a valid control object from useForm.');
//     return null;
//   }

//   const theme = useTheme();
//   const isDarkMode = theme.palette.mode === 'dark';

//   const {
//     field: { value, onChange, onBlur },
//     fieldState: { error },
//   } = useController({
//     name,
//     control,
//     defaultValue: '',
//   });

//   const getPlainText = (html) => {
//     const div = document.createElement('div');
//     div.innerHTML = html;
//     return div.textContent || div.innerText || '';
//   };

//   useEffect(() => {
//     if (isDarkMode) {
//       const style = document.createElement('style');
//       style.innerHTML = `
//         .ql-toolbar.ql-snow {
//           background-color: #2b2c40 !important;
//           color: #ffffff !important;
//           border: 1px solid #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-picker,
//         .ql-toolbar.ql-snow .ql-picker-label,
//         .ql-toolbar.ql-snow .ql-picker-item {
//           color:rgb(253, 248, 248) !important;
//         }
//         .ql-toolbar.ql-snow .ql-stroke {
//           stroke: #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-fill {
//           fill: #ffffff !important;
//         }
//         .ql-toolbar.ql-snow .ql-picker-options {
//           background-color: #2b2c40 !important;
//           color: #ffffff !important;
//         }
//         .ql-editor.ql-blank::before {
//           color: rgba(255, 255, 255, 0.6) !important;
//         }
//       `;
//       document.head.appendChild(style);
//       return () => document.head.removeChild(style);
//     }
//   }, [isDarkMode]);

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       [{ font: [] }],
//       [{ size: ['small', false, 'large', 'huge'] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ color: [] }, { background: [] }],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       [{ align: [] }],
//       ['link', 'image'],
//       ['clean'],
//     ],
//   };

//   const formats = [
//     'header', 'font', 'size',
//     'bold', 'italic', 'underline', 'strike', 'blockquote',
//     'list', 'bullet', 'indent',
//     'link', 'image', 'video',
//     'align',
//   ];

//   return (
//     <div>
//       <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => (
//             <ReactQuill
//               theme="snow"
//               value={value}
//               error={error}
//               onChange={(val) => {
//                 const plainText = getPlainText(val);
//                 onChange(plainText);
//               }}
//               onBlur={onBlur}
//               placeholder="Start typing message..."
//               modules={modules}
//               formats={formats}
//               {...rest}
//               style={{ height: '100%', width: '100%' }}
//             />
//           )}
//         />
//       </div>
//       {error && (
//         <div
//           style={{
//             fontSize: '0.75rem',
//             color: '#FF3E1D',
//             marginRight: '14px',
//             fontWeight: 400,
//             marginTop: '3px',
//           }}
//         >
//           {error.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RHFQuill;

  


// import React, { useEffect } from 'react';
// import 'react-quill/dist/quill.snow.css';
// import dynamic from 'next/dynamic';
// import { useTheme } from '@mui/material/styles';
// import { Controller, useController } from 'react-hook-form';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// const RHFQuill = ({ control, name, ...rest }) => {
//   const theme = useTheme();
//   const isDarkMode = theme.palette.mode === 'dark';

//   const {
//     field: { value, onChange, onBlur },
//     fieldState: { error },
//   } = useController({
//     name,
//     control,
//     defaultValue: '',
//   });

  // // Inject inline styles for dark mode
  // useEffect(() => {
  //   if (isDarkMode) {
  //     const style = document.createElement('style');
  //     style.innerHTML = `
  //       .ql-toolbar.ql-snow {
  //         background-color: #2b2c40 !important;
  //         color: #ffffff !important;
  //         border: 1px solid #444 !important;
  //       }
  //       .ql-toolbar.ql-snow .ql-picker,
  //       .ql-toolbar.ql-snow .ql-picker-label,
  //       .ql-toolbar.ql-snow .ql-picker-item {
  //         color: #ffffff !important;
  //       }
  //       .ql-toolbar.ql-snow .ql-stroke {
  //         stroke: #ffffff !important;
  //       }
  //       .ql-toolbar.ql-snow .ql-fill {
  //         fill: #ffffff !important;
  //       }
  //       .ql-toolbar.ql-snow .ql-picker-options {
  //         background-color: #2b2c40 !important;
  //         color: #ffffff !important;
  //       }
  //     `;
  //     document.head.appendChild(style);
  //     return () => document.head.removeChild(style);
  //   }
  // }, [isDarkMode]);

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       [{ font: [] }],
//       [{ size: ['small', false, 'large', 'huge'] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ color: [] }, { background: [] }],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       [{ align: [] }],
//       ['link', 'image'],
//       ['clean'],
//     ],
//   };

//   const formats = [
//     'header', 'font', 'size',
//     'bold', 'italic', 'underline', 'strike',
//     'list', 'bullet', 'indent',
//     'link', 'image', 'align',
//   ];

//   return (
//     <div>
//       <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => (
//             <ReactQuill
//               theme="snow"
//               value={value}
//               error={error}
//               onChange={(val) => onChange(val)}
//               onBlur={onBlur}
//               placeholder="Start typing message..."
//               modules={modules}
//               formats={formats}
//               {...rest}
//             />
//           )}
//         />
//       </div>
//       {error && (
//         <div style={{ fontSize: 12, color: '#FF3E1D', marginTop: '8px' }}>
//           {error.message}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RHFQuill;
