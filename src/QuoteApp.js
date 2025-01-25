import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './QuoteApp.css';
import Editor, { DiffEditor } from '@monaco-editor/react';

const API_URL = 'http://localhost:8083/ws';
const XML_PAYLOAD = `
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

function QuoteApp() {
    const [testResult, setTestResult] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [editorMode, setEditorMode] = useState('json');
    const [isJsonValid, setIsJsonValid] = useState(true); // eslint-disable-line
    const [uploadedFile, setUploadedFile] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [originalJson, setOriginalJson] = useState('{}');
    const [modifiedJson, setModifiedJson] = useState('{}');

    const [jsCode, setJsCode] = useState(''); // Store JavaScript code
const [debugOutput, setDebugOutput] = useState(''); // Store debug output

const handleDebug = () => {
    try {
        // Capture console.log output
        let output = '';
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            output += args.join(' ') + '\n';
        };

        // Execute the JavaScript code
        // eslint-disable-next-line no-new-func
        const func = new Function(jsCode);
        func();

        // Restore original console.log
        console.log = originalConsoleLog;

        // Set the debug output
        setDebugOutput(output || 'Code executed successfully (no output).');
    } catch (error) {
        setDebugOutput(`Error: ${error.message}`);
    }
};

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setTestResult(`File uploaded: ${file.name}`);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
        },
        maxSize: 5 * 1024 * 1024,
    });

    const handleSendQuote = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: XML_PAYLOAD,
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
            {/* 使用 react-tabs 实现选项卡 */}
            <Tabs>
                <TabList>
                    <Tab>Parse</Tab>
                    <Tab>Tuning</Tab>
                    <Tab>JSON Diff</Tab>
                </TabList>

                <TabPanel>
                    <div className="parse-tab">
                        <div className="button-area">
                        <input
    type="text"
    placeholder="Enter input here"
    className="input-field"
    value={inputValue} // State to manage input value
    onChange={(e) => setInputValue(e.target.value)} // Handler to update state
/>
                            <span className="script-tuning-text">Script Tuning Tool</span>
                            <button onClick={handleValidateJSON}>Validate JSON</button>
                            <button onClick={handleSendQuote}>Send Quote</button>
                            <button>Test Method</button>
                        </div>
                        <div className="content-area">
                            <div className="template-box">
                                <Editor
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
                </TabPanel>

                <TabPanel>
                    <div className="tuning-tab">
                        <h2>Tuning Tab</h2>
                        <p>This is the tuning tab content. You can add tuning-specific functionality here.</p>

                        <Editor
    height="300px"
    defaultLanguage="javascript"
    value={jsCode}
    onChange={(value) => setJsCode(value || '')}
    options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
    }}
/>
                    </div>

                    <button onClick={handleDebug}>Debug</button>

                    <div className="debug-output">
    <h3>Debug Output:</h3>
    <pre>{debugOutput}</pre>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="json-diff-tab">
                        <div className="diff-editors" style={{ display: 'flex', gap: '20px' }}>
                            <div className="editor-container" style={{ flex: 1 }}>
                                <h3>Original JSON</h3>
                                <Editor
                                    height="400px"
                                    defaultLanguage="json"
                                    value={originalJson}
                                    onChange={setOriginalJson}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                            <div className="editor-container" style={{ flex: 1 }}>
                                <h3>Modified JSON</h3>
                                <Editor
                                    height="400px"
                                    defaultLanguage="json"
                                    value={modifiedJson}
                                    onChange={setModifiedJson}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="diff-viewer">
                            <h3>Differences</h3>
                            <DiffEditor
                                height="400px"
                                original={originalJson}
                                modified={modifiedJson}
                                language="json"
                                options={{
                                    readOnly: true,
                                    renderSideBySide: true,
                                    minimap: { enabled: false }
                                }}
                            />
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default QuoteApp;
