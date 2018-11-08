<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="#all" version="3.0"
    xmlns="http://www.w3.org/2005/xpath-functions" xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:l="http://www.legislation.gov.uk/namespaces/legislation"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata"
    xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:mode on-no-match="shallow-copy" />
    <xsl:output encoding="UTF-8" method="text" />
    <!--<xsl:output method="xml" />-->

    <xsl:strip-space elements="*" />

    <xsl:variable name="historical">
        <xsl:sequence select="/sources/historical" />
    </xsl:variable>

    <xsl:template match="/">
        <xsl:variable as="node()" name="transformed-xml">
            <array>
                <map>
                    <string key="version">enacted</string>
                    <xsl:apply-templates select="/sources/enacted//l:Legislation" />
                </map>
                <map>
                    <string key="version">historical</string>
                    <xsl:apply-templates select="/sources/historical//l:Legislation" />
                </map>
            </array>
        </xsl:variable>
        <xsl:value-of select="xml-to-json($transformed-xml)" />
        <!--<xsl:sequence select="$transformed-xml" />-->
    </xsl:template>

    <xsl:template match="l:Legislation">
        <xsl:apply-templates select="ukm:Metadata" />
        <xsl:apply-templates select="l:Primary" />
    </xsl:template>

    <xsl:template match="ukm:Metadata">
        <string key="legislation">
            <xsl:value-of select="dc:title" />
        </string>
        <number key="year">
            <xsl:value-of select="ukm:PrimaryMetadata/ukm:Year/@Value" />
        </number>
        <number key="number">
            <xsl:value-of select="ukm:PrimaryMetadata/ukm:Number/@Value" />
        </number>
    </xsl:template>

    <xsl:template match="l:Primary">
        <array key="_">
            <xsl:apply-templates select="l:Body/l:Part" />
        </array>
    </xsl:template>

    <xsl:template match="l:CommentaryRef">
        <xsl:apply-templates select="//l:Commentary[@id = current()/@Ref]" />
    </xsl:template>

    <xsl:template match="*">
        <map>
            <string key="n">
                <xsl:value-of select="lower-case(local-name())" />
            </string>

            <xsl:if test="@id">
                <string key="id">
                    <xsl:value-of select="@id" />
                </string>
            </xsl:if>

            <xsl:if test="@Type">
                <string key="type">
                    <xsl:value-of select="@Type" />
                </string>
            </xsl:if>

            <!--<xsl:if test="l:Number">
                <string key="number">
                    <xsl:value-of select="l:Number" />
                </string>
            </xsl:if>
            <xsl:if test="l:Title">
                <string key="title">
                    <xsl:value-of select="normalize-space(l:Title)" />
                </string>
            </xsl:if>-->
            <!--
            <xsl:variable name="text">
                <xsl:for-each select="text()">
                    <xsl:value-of select="." />
                </xsl:for-each>
            </xsl:variable>

            <xsl:if test="normalize-space($text)">
                <string key="text">
                    <xsl:value-of select="normalize-space($text)" />
                </string>
            </xsl:if>-->

            <xsl:choose>
                <xsl:when test="count(descendant::*) > 1">
                    <xsl:if test="descendant::l:CommentaryRef | descendant::*[@CommentaryRef]">
                        <number key="cc">
                            <xsl:value-of
                                select="count(descendant::l:CommentaryRef) + count(descendant::*[@CommentaryRef])"
                             />
                        </number>
                    </xsl:if>

                    <xsl:if test="child::node() | @CommentaryRef">
                        <array key="_">
                            <xsl:if test="child::node()">
                                <xsl:apply-templates select="child::node()" />
                            </xsl:if>
                            <xsl:if test="@CommentaryRef">
                                <xsl:apply-templates
                                    select="//l:Commentary[@id = current()/@CommentaryRef]" />
                            </xsl:if>
                        </array>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:variable name="content">
                        <xsl:for-each select="text()">
                            <xsl:value-of select="." />
                        </xsl:for-each>
                    </xsl:variable>

                    <xsl:if test="normalize-space($content)">
                        <string key="{lower-case(local-name())}">
                            <xsl:value-of select="normalize-space($content)" />
                        </string>
                    </xsl:if>
                </xsl:otherwise>
            </xsl:choose>
        </map>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:if test="normalize-space(.)">
            <map>
                <string key="text">
                    <xsl:value-of select="normalize-space(.)" />
                </string>
            </map>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
