<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="#all" version="3.0"
    xmlns="http://www.w3.org/2005/xpath-functions" xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:l="http://www.legislation.gov.uk/namespaces/legislation"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output encoding="UTF-8" method="text" />
    <!--<xsl:output method="xml" />-->

    <xsl:strip-space elements="*" />

    <xsl:template match="/">
        <xsl:variable as="node()" name="transformed-xml">
            <map>
                <array key="nodes">
                    <map>
                        <string key="id">
                            <xsl:value-of select="l:Legislation/@IdURI" />
                        </string>
                        <string key="title">
                            <xsl:value-of select="l:Legislation/ukm:Metadata/dc:title" />
                        </string>
                        <number key="n">1</number>
                        <xsl:call-template name="group">
                            <xsl:with-param name="uri" select="l:Legislation/@IdURI" />
                        </xsl:call-template>
                    </map>
                    <xsl:apply-templates mode="nodes" select="//l:Citation" />
                </array>
                <array key="links">
                    <xsl:apply-templates mode="links" select="//l:Citation">
                        <xsl:with-param name="source" select="l:Legislation/@IdURI" tunnel="yes" />
                    </xsl:apply-templates>
                </array>
            </map>
        </xsl:variable>

        <xsl:value-of select="xml-to-json($transformed-xml)" />
    </xsl:template>

    <xsl:template name="group">
        <xsl:param name="uri" />

        <string key="group">
            <xsl:value-of select="tokenize($uri, '/')[5]" />
        </string>
    </xsl:template>

    <xsl:template match="l:Citation" mode="nodes">
        <map>
            <string key="id">
                <xsl:value-of select="@URI" />
            </string>
            <string key="title">
                <xsl:call-template name="citation-title" />
            </string>
            <number key="n">1</number>
            <xsl:call-template name="group">
                <xsl:with-param name="uri" select="@URI" />
            </xsl:call-template>
        </map>
    </xsl:template>

    <xsl:template name="citation-title">
        <xsl:value-of select="@Class" />
        <xsl:text>, </xsl:text>
        <xsl:value-of select="@Year" />
        <xsl:text>, </xsl:text>
        <xsl:value-of select="@Number" />
    </xsl:template>

    <xsl:template match="l:Citation" mode="links">
        <xsl:param name="source" tunnel="yes" />

        <map>
            <string key="source">
                <xsl:value-of select="$source" />
            </string>
            <!--<map key="target">
                <string key="id">
                    <xsl:value-of select="@URI" />
                </string>
                <string key="title">
                    <xsl:call-template name="citation-title" />
                </string>
            </map>-->
            <string key="target">
                <xsl:value-of select="@URI" />
            </string>
        </map>
    </xsl:template>
</xsl:stylesheet>
