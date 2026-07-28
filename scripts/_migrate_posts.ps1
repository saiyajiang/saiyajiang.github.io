$ErrorActionPreference = 'Stop'
$dir = 'E:\Workspace\saiyajiang.github.io\posts'
$files = @('post-song-1.html','post-poem-1.html','post-rpg-1.html','post-rpg-2.html','post-rpg-3.html','post-7.html','post-old-rpg.html','template.html')

$newHeader = @'
<header class="site-header" id="header">
    <div class="header-inner">
        <button class="menu-toggle" id="menuToggle" aria-label="菜单">
            <span></span><span></span><span></span>
        </button>
        <nav class="nav-menu" id="navMenu">
            <a href="../index.html">~/blog</a>
            <a href="../archive.html">~/archive</a>
            <a href="../about.html">~/about</a>
            <a href="../changelog.html">~/changelog</a>
        </nav>
        <button class="theme-toggle" id="themeToggle" aria-label="切换深色/亮色" title="切换主题">☀</button>
    </div>
</header>
'@

$newFooter = @'
<footer class="site-footer">
    <div class="footer-inner">
        <span>$ echo "&copy; 2026 悲歌的小站 &middot; Powered by GitHub Pages"</span>
        <div class="footer-links">
            <a href="https://github.com/saiyajiang/saiyajiang.github.io" target="_blank">Source</a>
        </div>
    </div>
</footer>
'@

$newHeaderEsc = $newHeader.Replace('$','$$')
$newFooterEsc = $newFooter.Replace('$','$$')

foreach ($f in $files) {
    $p = Join-Path $dir $f
    $c = Get-Content -Raw -Path $p

    # 1. html tag: add data-theme
    $c = $c -replace '<html lang="zh-CN">', '<html lang="zh-CN" data-theme="dark">'

    # 2. head cleanup: remove favicon, google fonts, inline theme script
    $c = $c -replace '(?m)^\s*<link rel="icon"[^>]*/>\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*<link href="https://fonts\.googleapis\.com[^>]*/>\s*\r?\n', ''
    $c = [regex]::Replace($c, '(?s)<script>\s*\(function \(\) \{.*?\}\)\(\);\s*</script>\s*\r?\n', '')

    # 3. remove bg-layer
    $c = [regex]::Replace($c, '(?s)\s*<div class="bg-layer">.*?<div class="bg-grid"></div>\s*</div>\s*\r?\n', "`n")

    # 4. header
    $c = [regex]::Replace($c, '(?s)<header class="site-header">.*?</header>', $newHeaderEsc)

    # 5. main class
    $c = $c -replace '<main class="post-page">', '<main class="page-content">'

    # 6. footer
    $c = [regex]::Replace($c, '(?s)<footer class="site-footer">.*?</footer>', $newFooterEsc)

    # 7. remove script tags
    $c = $c -replace '(?m)^\s*<script src="\.\./assets/(posts|playlist|site)\.js[^"]*"></script>\s*\r?\n', ''

    Set-Content -Path $p -Value $c -Encoding utf8NoBOM -NoNewline
    Write-Host "done: $f"
}
