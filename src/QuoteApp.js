import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'; // 引入 react-dropzone
import './QuoteApp.css';
import Editor from '@monaco-editor/react';

function QuoteApp() {
    const [testResult, setTestResult] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [editorMode, setEditorMode] = useState('json');
    const [isJsonValid, setIsJsonValid] = useState(true);
    const [uploadedFile, setUploadedFile] = useState(null); // 用于存储上传的文件

    // 处理文件上传
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setTestResult(`File uploaded: ${file.name}`);
        }
    };

    // 配置 react-dropzone
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'], // 限制上传文件类型为 JSON
        },
        maxSize: 5 * 1024 * 1024, // 限制文件大小为 5MB
    });

    const handleSendQuote = async () => {
        const apiUrl = 'http://localhost:8083/ws';
        const xmlPayload = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                             xmlns:sch="http://example.org/soapclient">
                <soapenv:Header/>
                <soapenv:Body>
                    <sch:getGreetingRequest>
                        <sch:name>victor</sch:name>
                    </sch:getGreetingRequest>
                </soapenv:Body>
            </soapenv:Envelope>
        `;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: xmlPayload,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const xmlString = await response.text();
            setTestResult(xmlString);
        } catch (error) {
            setTestResult(`Error: ${error.message}`);
        }
    };

    const handleTemplateChange = (newValue) => {
        setTemplateContent(newValue);
    };

    const handleValidateJSON = () => {
        try {
            JSON.parse(templateContent);
            setIsJsonValid(true);
            setEditorMode('json');
            setTestResult("Valid JSON!");
        } catch (e) {
            setIsJsonValid(false);
            setEditorMode('text');
            setTestResult("Invalid JSON!");
        }
    };

    return (
        <div className="quote-app">
            <div className="button-area">
                <span className="script-tuning-text">Script Tuning Tool</span>
                <button onClick={handleValidateJSON}>Validate JSON</button>
                <button onClick={handleSendQuote}>Send Quote</button>
                <button>Test Method</button>
            </div>
            <div className="content-area">
                <div className="template-box">
                    <Editor
                        height="100%"
                        width="100%"
                        defaultLanguage={editorMode}
                        value={templateContent}
                        onChange={handleTemplateChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            automaticLayout: true,
                        }}
                    />
                </div>
                <div className="test-result-box">
                    <pre>{testResult}</pre>
                </div>
            </div>

            {/* 上传区域 */}
            <div {...getRootProps()} className="upload-area">
                <input {...getInputProps()} />
                <p>Drag and drop a EML file here, or click to select a file</p>
                {uploadedFile && (
                    <div className="uploaded-file">
                        <strong>Uploaded File:</strong> {uploadedFile.name}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuoteApp;