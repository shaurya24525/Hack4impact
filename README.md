# README – Loading Chrome Extensions (Developer Mode)

This guide explains how to load the **PageMind Extension** and **BetterWeb Extension** in Chrome using Developer Mode.

## 1. Extract the Files

If you have a `.zip` file:

1. Locate `pagemind_extention.zip`
2. Right-click the file
3. Click **Extract All**
4. After extraction you should get a folder named `pagemind_extention`

You should now have two folders:

```
pagemind_extention/
BetterWeb-main/
```

---

## 2. Open Chrome Extensions Page

1. Open **Google Chrome**
2. In the address bar type:

```
chrome://extensions/
```

3. Press **Enter**

---

## 3. Enable Developer Mode

1. Look at the **top right corner**
2. Turn **Developer mode ON**

You will see three new buttons:

* Load unpacked
* Pack extension
* Update

---

## 4. Load the Extensions

### Load PageMind Extension

1. Click **Load unpacked**
2. Select the folder:

```
pagemind_extention/
```

3. Click **Select Folder**

The extension will now appear in Chrome.

---

### Load BetterWeb Extension

1. Click **Load unpacked**
2. Select the folder:

```
BetterWeb-main/
```

3. Click **Select Folder**

Chrome will install the extension.

---

## 5. Verify Installation

After loading:

* The extension will appear in `chrome://extensions/`
* You will see the extension name, icon, and toggle
* You can pin it using the **Chrome extensions icon (puzzle icon)** in the toolbar.

---

## 6. Updating the Extension

If you make changes to the code:

1. Go to:

```
chrome://extensions/
```

2. Click **Reload** on the extension card.

Chrome will update the extension immediately.

---

## 7. Troubleshooting

If the extension does not load:

* Ensure the folder contains a `manifest.json` file
* Do **not upload the zip file directly**
* Always select the **extracted folder**

Example structure:

```
pagemind_extention/
 ├ manifest.json
 ├ background.js
 ├ popup.html
 └ icons/
```
