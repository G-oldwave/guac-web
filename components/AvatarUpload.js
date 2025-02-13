import React, {useEffect, useState} from 'react';

import Modal from 'react-modal';
import {Trans, t} from '@lingui/macro';

import PhotoDropzone from 'components/PhotoDropzone';
import PhotoCropper from 'components/PhotoCropper';

import Image from 'components/Image';

const API_URL = process.env.API_URL;
export default function AvatarUpload(props){
	const [files, setFiles] = useState([]);
	const [image, setImage] = useState(null);
	const [imageType, setImageType] = useState(null);

    const [currentAvatar, setCurrentAvatar] = useState('//cdn.guac.live/profile-avatars/offline-avatar.png');

	const [modalIsOpen, setModalIsOpen] = useState(false);

	function openModal(){
		setModalIsOpen(true);
	}
    
	function closeModal(){
		setModalIsOpen(false);
	}

	function updateAvatar(){
		const formData = new FormData();
		formData.append('uri', image);
		fetch(API_URL + '/avatar', {
			headers: {
				Authorization: `Bearer ${props.user.token}`,
			},
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(r => {
			console.log('updateAvatar result', r);
            if(r.avatar) setCurrentAvatar(r.avatar);
			closeModal();
		})
		.catch(error => console.error(error));
	}

    
	useEffect(() => {
        if(props.user.avatar) setCurrentAvatar(props.user.avatar);
    }, [props.user]);

	useEffect(() => {
		console.log('test');
		console.log('files', files);
		if(files.length !== 0){
			setImageType(files[0].type || 'image/png');
			openModal();
		}
		return () => {
			files.forEach(file => URL.revokeObjectURL(file.preview));
		};
	}, [files]);

    return (
        <div className="justify-center items-start flex-shrink-0 flex flex-column pv2">
            <h3 className="f3 tracked mt0 mb3"><Trans>Upload Avatar</Trans></h3>
            <div className="flex flex-row">
                <div className="relative v-mid w3 h3">
                    <Image
                        src={currentAvatar}
                        alt={props.user.name}
                        shape="squircle"
                        fit="cover"
                        className={`ba b--transparent v-mid`}
                    />
                </div>
                <PhotoDropzone setFiles={setFiles} />
            </div>
            <div className="flex-row">
                <span className="dib f7 b"><Trans>Must be JPEG, GIF or PNG, and cannot exceed 10MB.</Trans></span>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel={i18n._(t`Update avatar`)}
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: '9999'
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--modal-background)',
                        borderColor: 'transparent',
                        borderRadius: '4px'
                    }
                }}
            >
                <h3 className="f3 tracked mt0 mb3 primary"><Trans>Upload Avatar</Trans></h3>
                {files.length > 0 && (
                    <PhotoCropper
                        imageType={imageType}
                        setImage={setImage}
                        imagePreview={files[0].preview}
                    />
                )}
                <button className="link color-inherit dib pv2 ph3 nowrap lh-solid pointer br2 ba b--dark-gray bg-dark-green guac-btn" onClick={updateAvatar}>
                    <span className="white">
                        <Trans>Save</Trans>
                    </span>
                </button>
            </Modal>
        </div>
    )
}