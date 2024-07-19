"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("title", title);
  }, [title]);

  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  async function handleShowSummary() {
    if (file && title) {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        console.log("loaded pdf:", pdf.numPages);

        let text = "";

        // Loop through each page and get text content
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          content.items.forEach((item) => {
            text += item.str + " ";
          });
        }

        sendToAPI(text);
      };
      fileReader.readAsArrayBuffer(file);
    }
  }

  function sendToAPI(text) {
    fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setShowSummary(true);
        console.log("response:", data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  function handleClear() {
    setSummary("");
    setTitle("");
    setFile(null);
    setShowSummary(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload PDF</h1>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={handleTitleChange}
              className="border border-gray-300 rounded p-2 mt-1 w-full text-black"
              required
            />
          </div>
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Upload PDF
            </label>
            <input
              id="file"
              type="file"
              name="file"
              accept=".pdf"
              onChange={onFileChange}
              className="border border-gray-300 text-black rounded p-2 mt-1 w-full"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleShowSummary}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={!file || !title}
            >
              Show Summary
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>
        </form>

        {showSummary && summary && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl text-gray-700 font-semibold mb-2">
              {localStorage.getItem("title")}
            </h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
