import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react'
import { parseHtmlSanitizeAddTargetToLinks } from '../utils/util2'
import html from './content.html';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '.5px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function BasicModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const hash = window.location.hash;
      
        // Only auto-open if hash is present
        if (hash && hash.startsWith('#bookmarkSection')) {
          setOpen(true);
        }
      }, []);
      
      useEffect(() => {

        if (open) {
          const hash = window.location.hash;
          if (hash) {
            const el = document.getElementById(hash.substring(1));
            if (el) {
              setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }
        }
      }, [open]);
      
    //   const handleOpen = () => setOpen(true);
    //   const handleClose = () => setOpen(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/guide.css";
        // link.href = "https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/dtaa.css";
        // link.href = "https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/decision.css";
        link.id = "external-css";

        if (!document.getElementById("external-css")) {
            document.head.appendChild(link);
        }

        return () => {
            document.getElementById("external-css")?.remove(); // Cleanup on unmount
        };

    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    // const [foundContent, setFoundContent] = useState('')


    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
    }
    // useEffect(() => {
    //     const hash = window.location.hash;
    //     if (hash && document.getElementById(hash.substring(1))) {
    //       handleOpen(); // This opens the modal
    //     }
    //   }, []);
      

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Button onClick={handleOpen}>Open modal</Button>
            </div>
            <div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">

                            <input type="text" value={searchTerm} onChange={handleSearchChange} />

                            {parseHtmlSanitizeAddTargetToLinks(html, searchTerm)}

                        </Typography>
                       
                    </Box>
                </Modal>
            </div>
        </>
    );
}
