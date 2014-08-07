<?php
    require_once('Parsedown.php');
    $Parsedown = new Parsedown();
?>
<!DOCTYPE html>
<html data-tpl-cache-id="4">
<head>
    <title>Auto Admin Forms 2.0</title>
    <link rel="stylesheet" type="text/css" href="css/main.css">
    <script src="js/jquery-2.1.1.min.js"></script>
</head>
<body>
    <header>
        <nav id="nav-header" class="nav-header">
            <div class="site-actions">
                <a href="#" class="log-out fa"><i class="fa fa-times" title="log out"></i>Log Out</a>
                <a href="#" class="refresh-menu fa"><i class="fa fa-refresh" title="refresh menu"></i>Refresh Menu</a>
            </div>
            <ul class="nav-level--1">
                <li class="nav-item--1">
                    <a href="index.html">Home</a>
                </li>
                <li class="nav-item--1 has-children">
                    <a href="#">System</a>
                    <ul class="nav-level--2">
                        <li class="nav-item--2">
                            <a href="job-submission.html">Job Submission</a>
                        </li>
                        <li class="nav-item--2">
                            <a href="email_dist.html">Email Distribution Lists</a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item--1">
                    <a href="#">Promotions</a>
                    <ul class="nav-level--2">
                        <li class="nav-item--2">
                            <a href="report-data-calcs.html">Report Data Calcs</a>
                        </li>
                        <li class="nav-item--2 has-children">
                            <a href="#">Another nav item</a>
                            <ul class="nav-level--3">
                                <li class="nav-item--3">
                                    <a href="#">Another nav itemnother nav itemnother nav item</a>
                                </li>
                                <li class="nav-item--3">
                                    <a href="#">Another nav item</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
                <li class="nav-item--1">
                    <a href="#">Nav Item</a>
                </li>
                <li class="nav-item--1">
                    <a href="#">Nav Item</a>
                </li>
                <li class="nav-item--1">
                    <a href="#">Nav Item</a>
                </li>
                <li class="nav-item--1">
                    <a href="#">Nav Item</a>
                </li>
                <li class="nav-item--1">
                    <a href="#">Nav Item</a>
                </li>
            </ul>
        </nav><!-- #nav-main.nav-main -->
    </header>
    <main id="main" class="content <?php echo implode(' ',$main_classes); ?>">
        <h1 class="page-title"><?php echo $header_text; ?></h1>